import { IdResolver } from '@atproto/identity'
import { Jetstream } from "@skyware/jetstream";

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */


export default {
	async scheduled(
		controller: ScheduledController,
		env: Env,
		ctx: ExecutionContext,
	  ) {


		let now_us = Date.now() * 1000;
		let five_minutes_ago_us = now_us - (1000 * 1000 * 60 * 5);

		console.log(`cron process start at us ${now_us} and reading with cursor ${five_minutes_ago_us}`);

		let uri = `wss://jetstream2.us-east.bsky.network/subscribe\?wantedCollections=xyz.statusphere.status\&cursor=${five_minutes_ago_us}`;
		

		const jetstream = new Jetstream({
			wantedCollections: ["xyz.statusphere.status"],
			cursor: five_minutes_ago_us,
		});


		function checktime(us: number) {


				if (us >= now_us) {
					console.log("reached current time at worker start, closing client");

					jetstream.close()
				
				}
		}

		function insert_status_update(uri: string, did: string, status: string, createdAt: string, indexed_us: number) {
			// await db
            // .insertInto('status')
            // .values({
            //   uri: evt.uri.toString(),
            //   authorDid: evt.did,
            //   status: record.status,
            //   createdAt: record.createdAt,
            //   indexedAt: now.toISOString(),
            // })
            // .onConflict((oc) =>
            //   oc.column('uri').doUpdateSet({
            //     status: record.status,
            //     indexedAt: now.toISOString(),
            //   })
            // )
            // .execute()
		}

		function delete_status_update() {
			// Remove the status from our SQLite
			// await db.deleteFrom('status')
			//   .where('uri', '=', evt.uri.toString()).execute()
		}


		jetstream.onCreate("xyz.statusphere.status", (event) => {
			let x = JSON.stringify(event)
			console.log(`New post with record: ${x}`);
			checktime(event.time_us);
			// let s: Object =event.did;
			// insert_status_update(event.commit.record.subject.uri)
			event.commit.rkey
			// NOTE: uri is a combo of did + record type (collection?) + rkey, so can just generate these (OR: use DID + rkey directly, that's better tbh anyway)
			// ok hell yeah roadblock cleared
			// also: my understanding of the update-on-conflict case is just if an update is published for a _specific_ status update event, not if a user publishes _any_ new status

			// HELL YEAH ok I updated the schema but not actual db contents, looks like now I can just port the json over and be ready, nice. nice. yeah. ok go tf to sleep lol


			// OK IMPORTANT NOTE: next up test ability to do repo reads/writes type stuff. at this point I have proof of conecpt
			// for firehose read via jetstream, next important proof is ability to do writes to the system. plumbing via d3 can wait.
		});


		jetstream.onUpdate("xyz.statusphere.status", (event) => {
			let x = JSON.stringify(event)
			console.log(`New post with record: ${x}`);
			checktime(event.time_us);
		});

		
		jetstream.onDelete("xyz.statusphere.status", (event) => {
			console.log(`Deleted post with rkey: ${event.commit.rkey}`)
			checktime(event.time_us);
		});

		jetstream.on("account", (event) => {
			// console.log(`Account updated: ${event.did}`)
			checktime(event.time_us);
		});

		jetstream.on("identity", (event) => {
			// console.log(`identity event: ${event.did}`)
			checktime(event.time_us);
		});

		jetstream.start()

		let closed = new Promise((resolve, reject) => {
			jetstream.on("close", () => {
					console.log("connection closed");
					resolve(null);
				})
		});

		ctx.waitUntil(closed);
	  },
	

	async fetch(request, env, ctx): Promise<Response> {
		// let uri = "wss://jetstream2.us-east.bsky.network/subscribe\?wantedCollections=xyz.statusphere.status";
		
		// console.log("init");

        // var ws = new WebSocket(uri);
		// ws.addEventListener("message", (event) => {
		// 	console.log("Message from server ", event.data);
		// });

		// let closed = new Promise((resolve, reject) => {
		// 		ws.addEventListener("close", (event) => {
		// 			// resolve(());
		// 			console.log("close");
		// 			resolve(null);
		// 		})
		// });

		// ctx.waitUntil(closed);

		return new Response("idk");
	},
} satisfies ExportedHandler<Env>;


// interface Next<T> {
// 	elem: T;
// 	next_promise: Promise<Next<T>>;
//   }
  


// function connect(uri: string): Promise<Next<MessageEvent>> {
//     return new Promise((resolve, reject) => {
// 		let next_resolve = resolve;
//         var ws = new WebSocket(uri);
// 		ws.addEventListener("message", (event) => {
// 			console.log("Message from server ", event.data);
// 			let next_promise: Promise<Next<MessageEvent>> = new Promise((resolve, reject) => {
// 				next_resolve = resolve;
// 			})
// 			next_resolve({next_promise, elem: event});
// 		  });
//     });
// }
