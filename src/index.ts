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
		let one_minute_ago_us = now_us - (1000 * 1000 * 60);

		console.log(`cron process start at us ${now_us} and reading with cursor ${one_minute_ago_us}`);

		// let uri = `wss://jetstream2.us-east.bsky.network/subscribe\?wantedCollections=xyz.statusphere.status\&cursor=${one_minute_ago_us}`;
		

		const jetstream = new Jetstream({
			wantedCollections: ["app.bsky.feed.post"],
			wantedDids: ["did:plc:qvywnipfiyrd6v4qdf4x27wy"],
			cursor: one_minute_ago_us,
		});

		let observed = 0;


		function checktime(us: number) {


				if (us >= now_us) {
					console.log(`reached current time at worker start, closing client after observing ${observed}`);

					jetstream.close()
				
				}
		}


		jetstream.onCreate("app.bsky.feed.post", (event) => {
			let x = JSON.stringify(event.commit.record)
			observed += 1;
			console.log(`New post with record: ${x}`);
			checktime(event.time_us);
		});
		
		jetstream.onDelete("app.bsky.feed.post", (event) => {
			console.log(`Deleted post with rkey: ${event.commit.rkey}`)
			checktime(event.time_us);
		});

		jetstream.on("account", (event) => {
			console.log(`Account updated: ${event.did}`)
			checktime(event.time_us);
		});

		jetstream.on("identity", (event) => {
			console.log(`identity event: ${event.did}`)
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
