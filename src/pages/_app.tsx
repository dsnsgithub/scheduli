import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "../components/Navbar";
import { Analytics } from "@vercel/analytics/react";

import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<title>Scheduli</title>
				<meta property="og:type" content="website" />
				<meta property="og:title" content="Scheduli" />
				<meta property="og:description" content="Scheduli keeps you informed about your daily schedule, even during the most chaotic days." />
				<meta name="description" content="Scheduli keeps you informed about your daily schedule, even during the most chaotic days." />
				<meta property="og:url" content="https://scheduli.dsns.dev" />
				<meta property="og:image" content="https://scheduli.dsns.dev/scheduli.png" />
				<meta name="apple-itunes-app" content="app-id=6470429917"></meta>
			</Head>
			<main className="min-h-screen">
				<Navbar />
				<Component {...pageProps} />
				<Analytics />
			</main>
		</>
	);
}
