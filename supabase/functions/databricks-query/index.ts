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

    // Validate query is one of the allowed views
    const allowedTables = [
      'hackathon.ui_kpis',
      'hackathon.ui_top10_total_kwh',
      'hackathon.ui_top10_intensity',
      'hackathon.ui_buildings',
      'hackathon.ui_hourly_timeseries',
      'hackathon.ui_building_hourly_profile',
      'hackathon.ui_building_heatmap',
      'hackathon.ui_top_anomalies',
    ];

    // Simple validation - ensure query references only allowed tables
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

    const response = await fetch(statementUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATABRICKS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        warehouse_id: warehouseId,
        statement: query,
        wait_timeout: '30s',
        parameters: params || [],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Databricks API error: ${response.status} - ${errorText}`);
    }

    const result: DatabricksResponse = await response.json();

    // Check for execution errors
    if (result.status?.state === 'FAILED' || result.error) {
      throw new Error(result.error?.message || 'Query execution failed');
    }

    // Transform result to array of objects
    const columns = result.manifest?.schema?.columns || [];
    const dataArray = result.result?.data_array || [];

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
