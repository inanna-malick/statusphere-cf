import type {
  NodeSavedSession,
  NodeSavedSessionStore,
  NodeSavedState,
  NodeSavedStateStore,
} from '@atproto/oauth-client-node'


type AuthStateRow = {
  key: string;
  state: string;
  };


type AuthSessionRow = {
  key: string;
  session: string;
  };

export class StateStore implements NodeSavedStateStore {
  constructor(private env: Env) {}
  async get(key: string): Promise<NodeSavedState | undefined> {

    const result = await this.env.DB.prepare(
      "SELECT * FROM auth_state WHERE key = ?",
    )
      .bind(key)
      .first<AuthStateRow>();


    // const result = await this.env.DB.selectFrom('auth_state').selectAll().where('key', '=', key).executeTakeFirst()
    if (!result) return
    return JSON.parse(result.state) as NodeSavedState
  }
  async set(key: string, val: NodeSavedState) {
    const state = JSON.stringify(val)

    await this.env.DB.prepare("INSERT INTO auth_state (key, state) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET state = ?"      
    ).bind(key, state, state).run();

    // TODO: idk, throw if this fails?

    // await this.env.DB
    //   .insertInto('auth_state')
    //   .values({ key, state })
    //   .onConflict((oc) => oc.doUpdateSet({ state }))
    //   .execute()
  }

  async del(key: string) {
    // await this.env.DB.deleteFrom('auth_state').where('key', '=', key).execute()
    await this.env.DB.prepare('DELETE FROM auth_state key = ?').bind(key).run()
  }
}

export class SessionStore implements NodeSavedSessionStore {
  constructor(private env: Env) {}
  async get(key: string): Promise<NodeSavedSession | undefined> {

    const result = await this.env.DB.prepare(
      "SELECT * FROM auth_session WHERE key = ?",
    )
      .bind(key)
      .first<AuthSessionRow>();

    // const result = await this.env.DB.bind('SLECT Fauth_session').selectAll().where('key', '=', key).executeTakeFirst()
    if (!result) return
    return JSON.parse(result.session) as NodeSavedSession
  }
  async set(key: string, val: NodeSavedSession) {
    const session = JSON.stringify(val)



    await this.env.DB.prepare("INSERT INTO auth_session (key, session) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET session = ?"      
    ).bind(key, session, session).run();

    // await this.env.DB
    //   .insertInto('auth_session')
    //   .values({ key, session })
    //   .onConflict((oc) => oc.doUpdateSet({ session }))
    //   .execute()
  }
  async del(key: string) {
    // await this.env.DB.deleteFrom('auth_session').where('key', '=', key).execute()
    await this.env.DB.prepare('DELETE FROM auth_session key = ?').bind(key).run()
  }
}
