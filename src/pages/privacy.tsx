export default function Privacy() {
	return (
		<div className="container mx-auto mt-10">
			<div className="shadow-xl flex flex-col items-center justify-center bg-wedgewood-200 p-8">
				<h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>

				<h3 className="text-xl">
					{
						"We collect minimal data about you. We use Vercel Analytics, but it is anonymized. We don't store any user information on our servers. Our app even works offline, only accessing the internet to download a schedule."
					}
				</h3>
			</div>
		</div>
	);
}
