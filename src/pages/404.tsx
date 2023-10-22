import Link from "next/link";

export default function NotFound() {
	return (
		<div>
			<div className="container mx-auto mt-10 rounded-xl m-4 p-6 bg-wedgewood-300 text-center">
				<h2 className="text-4xl mb-4 font-bold">404 - This website was not found.</h2>

				<Link href="/" className="underline">
					<h2 className="text-xl mb-4">Return home.</h2>
				</Link>
			</div>
		</div>
	);
}
