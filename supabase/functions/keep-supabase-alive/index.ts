import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const SUPABASE_ACCESS_TOKEN = Deno.env.get('MANAGEMENT_SUPABASE_ACCESS_TOKEN')
const managementApiUrl = 'https://api.supabase.com/v1/projects'

Deno.serve(async () => {
  const projects = (await getProjects()).filter(
    (project) => project.status === 'ACTIVE_HEALTHY'
  )

  const results = []
  for (const project of projects) {
    const { id, name } = project

    try {
      await keepAlive(id)

      results.push({ project: name, status: 'success' })
    } catch (err) {
      results.push({
        project: name,
        status: 'error',
        message: err.message,
      })
    }
  }

  return new Response(JSON.stringify({ results }), { status: 200 })
})

interface SupabaseError {
  message: string
}

interface Project {
  id: string
  organization_id: string
  name: string
  region: string
  created_at: string
  database?: {
    host: string
    version: string
    postgres_engine: string
    release_channel: string
  }
  status:
    | 'ACTIVE_HEALTHY'
    | 'ACTIVE_UNHEALTHY'
    | 'COMING_UP'
    | 'GOING_DOWN'
    | 'INACTIVE'
    | 'INIT_FAILED'
    | 'REMOVED'
    | 'RESTARTING'
    | 'UNKNOWN'
    | 'UPGRADING'
    | 'PAUSING'
    | 'RESTORING'
    | 'RESTORE_FAILED'
    | 'PAUSE_FAILED'
}

async function getProjects() {
  const response = await fetch(managementApiUrl, {
    headers: {
      Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
    },
  })

  const projects = (await response.json()) as Project[]
  if (isSupabaseError(projects)) {
    console.error('Projects result:', projects)
    throw new Error('No projects found')
  }

  return projects
}

async function keepAlive(projectRef: string) {
  const runSqlQueryUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`
  const response = await fetch(runSqlQueryUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: 'SELECT 1',
    }),
  })
  const data = await response.json()

  if (isSupabaseError(data)) {
    console.error('Error running query on project:', projectRef, data.message)
    throw new Error(data.message)
  }

  return data
}

// deno-lint-ignore no-explicit-any
const isSupabaseError = (data: any): data is SupabaseError => {
  return data.message
}
