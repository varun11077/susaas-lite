import cds from '@sap/cds'

// Boots this project (like `cds watch`) for the tests, once per test file.
cds.test(import.meta.dirname + '/..')

const alice = new cds.User({ id: 'alice', roles: ['Admin', 'Member'] })
const carol = new cds.User({ id: 'carol', roles: ['Member'] })
const dave  = new cds.User({ id: 'dave',  roles: ['Member'] })
const nobody = new cds.User({ id: 'eve',  roles: [] })

const PROJECT_TWO = '22222222-2222-2222-2222-222222222222'

async function readProjects(user, service = 'PublicService') {
  const srv = await cds.connect.to(service)
  const { Projects } = srv.entities
  return srv.tx({ user }, tx => tx.run(SELECT.from(Projects)))
}

describe('PublicService.Projects (instance-based access)', () => {
  it('Admin sees both projects', async () => {
    const rows = await readProjects(alice)
    expect(rows.map(r => r.title).sort()).toEqual(['Project One', 'Project Two'])
  })

  it('carol sees only Project One', async () => {
    const rows = await readProjects(carol)
    expect(rows.map(r => r.title)).toEqual(['Project One'])
  })

  it('dave sees only Project Two', async () => {
    const rows = await readProjects(dave)
    expect(rows.map(r => r.title)).toEqual(['Project Two'])
  })

  it('carol cannot read Project Two directly by its ID', async () => {
    const srv = await cds.connect.to('PublicService')
    const { Projects } = srv.entities
    const row = await srv.tx({ user: carol }, tx =>
      tx.run(SELECT.one.from(Projects).where({ ID: PROJECT_TWO })))
    expect(row).toBeFalsy()
  })
})

describe('positive control', () => {
  it('carol CAN read Project One directly by its ID', async () => {
    const srv = await cds.connect.to('PublicService')
    const { Projects } = srv.entities
    const row = await srv.tx({ user: carol }, tx =>
      tx.run(SELECT.one.from(Projects).where({ ID: '11111111-1111-1111-1111-111111111111' })))
    expect(row?.title).toBe('Project One')
  })
})

describe('role checks', () => {
  it('a Member cannot use AdminService', async () => {
    await expect(readProjects(carol, 'AdminService')).rejects.toSatisfy(e => String(e.code) === '403')
  })

  it('a user without roles cannot use PublicService', async () => {
    await expect(readProjects(nobody)).rejects.toSatisfy(e => String(e.code) === '403')
  })
})
