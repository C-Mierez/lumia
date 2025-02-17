"use client";

export default function Test() {
    // const test = trpc.videos.test.useMutation({
    //     onSuccess() {
    //         toast.success("Mutation successful");
    //     },
    // });
    // const test2 = trpc.videos.test2.useMutation({
    //     onSuccess() {
    //         toast.success("Mutation successful");
    //     },
    // });

    // console.log("Rendering Test");

    // trpc.videos.onTest2.useSubscription(
    //     skipToken,
    //     // undefined,
    //     {
    //         onStarted() {
    //             toast.info("Subscription started");
    //         },
    //         onData(data) {
    //             toast.info(`Event received. Data: ${data}`);
    //         },
    //         onError() {
    //             toast.error("Subscription error");
    //         },
    //     },
    // );

    return (
        <div>
            {/* <Button onClick={() => test.mutate()} disabled={test.isPending}>
                Mutate
            </Button>
            <Button onClick={() => test2.mutate()} disabled={test2.isPending}>
                Mutate 2
            </Button> */}
        </div>
    );
}
