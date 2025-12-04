import { NextResponse } from "next/server";

type SeriesPoint = { year: string; value: number };

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      indicator,
      countryA,
      countryB,
      seriesA,
      seriesB,
    }: {
      indicator: string;
      countryA: string;
      countryB?: string;
      seriesA: SeriesPoint[];
      seriesB?: SeriesPoint[];
    } = body;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          summary:
            "OPENAI_API_KEY is not set on the server. Add it to .env.local (for dev) and Vercel project settings (for production), then try again.",
        },
        { status: 500 }
      );
    }

    if (!indicator || !countryA || !seriesA || seriesA.length === 0) {
      return NextResponse.json(
        {
          summary:
            "Insufficient data was provided to generate an LLM summary. Please ensure you have generated graphs & data first.",
        },
        { status: 400 }
      );
    }

    const seriesAString = seriesA
      .map((p) => `${p.year}: ${p.value}`)
      .join(", ");

    const seriesBString =
      seriesB && seriesB.length > 0
        ? seriesB.map((p) => `${p.year}: ${p.value}`).join(", ")
        : "";

    const comparisonText =
      seriesB && seriesB.length > 0 && countryB
        ? `\n\nFor ${countryB}, the indicator series is:\n${seriesBString}\n\nPlease compare ${countryA} and ${countryB} clearly.`
        : "\n\nNo comparison country was provided; focus on a clear analysis for the primary country only.";

    const prompt = [
      `You are an expert public health data analyst.`,
      `You are given a world health indicator time series from 2000 to 2023, taken from a cleaned CSV dataset used in a student dashboard project.`,
      ``,
      `Indicator: ${indicator}`,
      `Country/Region A: ${countryA}`,
      `Time series for ${countryA}:`,
      seriesAString,
      comparisonText,
      ``,
      `TASK:`,
      `Write a clear, accurate, student-friendly narrative (no more than about 3 short paragraphs) that:`,
      `1. Describes the overall trend over time (increasing/decreasing/stable) and any important spikes or drops.`,
      `2. Interprets what this might mean in real-world terms (e.g. births, deaths, life expectancy or the meaning of the indicator).`,
      `3. If a comparison country was provided, compares the two countries honestly and highlights key differences or similarities.`,
      `4. Avoids guessing specific causes unless they are very generic (e.g. "policy changes", "economic conditions", "health system strength").`,
      `5. Avoids making up any numbers not present in the data – use only qualitative language about direction and relative levels.`,
      ``,
      `Keep the tone neutral and analytical, suitable for a college assignment.`,
    ].join("\n");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are a careful public health data analyst. You must be honest about uncertainty and never invent precise numbers that are not present.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        {
          summary:
            "LLM API returned an error. Check your API key and model name. Raw response: " +
            text,
        },
        { status: 500 }
      );
    }

    const json = await response.json();
    const summary =
      json.choices?.[0]?.message?.content ??
      "No summary content was returned by the LLM.";

    return NextResponse.json({ summary });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error in llm-summary route.";
    return NextResponse.json(
      {
        summary:
          "Server-side error when generating LLM summary: " + message,
      },
      { status: 500 }
    );
  }
}
