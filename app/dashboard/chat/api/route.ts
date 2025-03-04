import { NextResponse } from "next/server";
import weaviate, { WeaviateClient } from "weaviate-client";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const client: WeaviateClient = await weaviate.connectToWeaviateCloud(
    process.env.WEAVIATE_URL as string,
    {
      authCredentials: new weaviate.ApiKey(process.env.ADMIN_API_KEY as string),
      headers: {
        "X-OpenAI-Api-Key": process.env.OPENAI_API_KEY as string,
      },
    }
  );

  const response = await client.isReady();

  if (response) {
    // //Example of how to create a collection and populate it with data
    // async function createCollection() {
    //   const questions = await client.collections.create({
    //     name: "Bar",
    //     vectorizers: vectorizer.text2VecOpenAI(),
    //     generative: generative.openAI(),
    //   });
    //   console.log(`Collection ${questions.name} created!`);
    // }
    //
    // await createCollection();

    // // get json file in the current folder
    // const dataset = data;
    //
    // async function importRecepies() {
    //   // Get the questions directly from the URL
    //   const cocktails = client.collections.get("Bar");
    //   const result = await cocktails.data.insertMany(dataset);
    //   console.log("We just bulk inserted", result);
    // }
    //
    // await importRecepies();

    const cocktails = client.collections.get("Bar");

    const result = await cocktails.generate.nearText(
      prompt,
      {
        groupedTask:
          "You are a virtual bartender, but do not say it directly, just keep in mind, say something friendly to a customer and tell a short story about 3 selected cocktails. " +
          "Limit yourself to 5 sentences. Be compassionate and supportive.",
      },
      {
        limit: 3,
      }
    );

    await client.close(); // Close the client connection

    return new NextResponse(
      JSON.stringify({
        items: result.objects,
        generated: result.generated,
        userPrompt: prompt,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } else {
    return new NextResponse(
      JSON.stringify({
        error: "Weaviate client is not ready",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
