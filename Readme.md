###Example

####In GraphQL server subscription:

	Subscription: {
		myCommand: {
			subscribe: (obj, args, context, info) => {

				const asyncIterator = new EventEmitterAsyncIterator();

				const pushMyCommand = (myCommand) => {
					asyncIterator.pushValue({
						myCommand: myCommand
					});
				};

				asyncIterator.once('return', () => {
					// The client has unsubscribed
				});

				return asyncIterator;
			}
		}
	}
