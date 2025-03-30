import { Firehose } from '@atproto/sync'
import { IdResolver } from '@atproto/identity'

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

		let uri = `wss://jetstream2.us-east.bsky.network/subscribe\?wantedCollections=xyz.statusphere.status\&cursor=${one_minute_ago_us}`;
		

        var ws = new WebSocket(uri);

		function on_msg(event: MessageEvent) {

			if (typeof event.data === 'string') {
				const data = JSON.parse(event.data);
				console.log("Message from server with time", data.time_us);
				if (data.time_us >= now_us) {
					console.log("reached current time at worker start, closing websocket");
					ws.removeEventListener("message", on_msg);
					ws.close();
				}
			  } else {
				 // Handle cases where event.data is not a string, e.g., ArrayBuffer, Blob, etc.
				console.warn('Unexpected data type:', event.data);
			  }
		}

		ws.addEventListener("message", on_msg);

		let closed = new Promise((resolve, reject) => {
				ws.addEventListener("close", (event) => {
					console.log("close");
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
