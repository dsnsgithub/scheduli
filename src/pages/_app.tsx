import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "../components/Navbar";

import Head from "next/head"

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<title>Scheduli</title>
			</Head>
			<main className="min-h-screen ">
				<Navbar />
				<Component {...pageProps} />
			</main>
		</>
	);
}
