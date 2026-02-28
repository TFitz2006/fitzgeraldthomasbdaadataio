import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DatabricksResponse {
  manifest?: {
    schema?: {
      columns?: Array<{ name: string; type_name: string }>;
    };
  };
  result?: {
    data_array?: Array<Array<string | number | null>>;
  };
  status?: {
    state?: string;
  };
  error?: {
    message?: string;
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DATABRICKS_HOST = Deno.env.get('DATABRICKS_HOST');
    const DATABRICKS_HTTP_PATH = Deno.env.get('DATABRICKS_HTTP_PATH');
    const DATABRICKS_TOKEN = Deno.env.get('DATABRICKS_TOKEN');

    if (!DATABRICKS_HOST || !DATABRICKS_HTTP_PATH || !DATABRICKS_TOKEN) {
      throw new Error('Missing Databricks configuration');
    }

    const { query, params } = await req.json();

    if (!query) {
      throw new Error('Query is required');
    }

    // Validate query references allowed tables (workspace.hackathon.*)
    const allowedTables = [
      'workspace.hackathon.ui_kpis',
      'workspace.hackathon.ui_top10_total_kwh',
      'workspace.hackathon.ui_top10_intensity',
      'workspace.hackathon.ui_buildings',
      'workspace.hackathon.ui_hourly_timeseries',
      'workspace.hackathon.ui_building_hourly_profile',
      'workspace.hackathon.ui_building_heatmap',
      'workspace.hackathon.ui_top_anomalies',
    ];

    const queryLower = query.toLowerCase();
    const hasValidTable = allowedTables.some(table => 
      queryLower.includes(table.toLowerCase())
    );

    if (!hasValidTable) {
      throw new Error('Invalid query: must reference an allowed table');
    }

    // Execute query via Databricks SQL Statement API
    const statementUrl = `https://${DATABRICKS_HOST}/api/2.0/sql/statements`;
    
    // Extract warehouse ID from HTTP path (format: /sql/1.0/warehouses/WAREHOUSE_ID)
    const warehouseMatch = DATABRICKS_HTTP_PATH.match(/warehouses\/([a-z0-9]+)/i);
    if (!warehouseMatch) {
      throw new Error('Invalid HTTP path format');
    }
    const warehouseId = warehouseMatch[1];

    console.log(`Executing query on warehouse ${warehouseId}:`, query);

    const response = await fetch(statementUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATABRICKS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        warehouse_id: warehouseId,
        statement: query,
        wait_timeout: '50s',
        parameters: params || [],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Databricks API error: ${response.status}`, errorText);
      throw new Error(`Databricks API error: ${response.status} - ${errorText}`);
    }

    let result: DatabricksResponse = await response.json();

    // Check for execution errors
    if (result.status?.state === 'FAILED' || result.error) {
      const errorMsg = result.error?.message || 'Query execution failed';
      console.error('Query failed:', errorMsg, JSON.stringify(result));
      throw new Error(errorMsg);
    }

    // Poll if query is still pending/running (warehouse cold start)
    const statementId = (result as any).statement_id;
    let pollAttempts = 0;
    const maxPollAttempts = 30; // ~60 seconds total
    while (
      (result.status?.state === 'PENDING' || result.status?.state === 'RUNNING') &&
      pollAttempts < maxPollAttempts
    ) {
      pollAttempts++;
      console.log(`Query still ${result.status?.state}, polling attempt ${pollAttempts}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));

      const pollResponse = await fetch(`${statementUrl}/${statementId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${DATABRICKS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!pollResponse.ok) {
        const errorText = await pollResponse.text();
        throw new Error(`Poll error: ${pollResponse.status} - ${errorText}`);
      }

      result = await pollResponse.json();

      if (result.status?.state === 'FAILED' || result.error) {
        throw new Error(result.error?.message || 'Query execution failed');
      }
    }

    if (result.status?.state === 'PENDING' || result.status?.state === 'RUNNING') {
      throw new Error('Query timed out after polling - warehouse may still be starting');
    }

    // Transform result to array of objects
    const columns = result.manifest?.schema?.columns || [];
    const dataArray = result.result?.data_array || [];

    console.log(`Query returned ${dataArray.length} rows with ${columns.length} columns`);

    const data = dataArray.map((row) => {
      const obj: Record<string, unknown> = {};
      columns.forEach((col, index) => {
        let value = row[index];
        // Parse numeric types
        if (col.type_name === 'DOUBLE' || col.type_name === 'FLOAT' || col.type_name === 'DECIMAL') {
          value = value !== null ? parseFloat(String(value)) : null;
        } else if (col.type_name === 'INT' || col.type_name === 'LONG' || col.type_name === 'BIGINT') {
          value = value !== null ? parseInt(String(value), 10) : null;
        }
        obj[col.name] = value;
      });
      return obj;
    });

    return new Response(JSON.stringify({ data, success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Databricks query error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
