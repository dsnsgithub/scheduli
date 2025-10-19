export default function Privacy() {
  return (
    <div className="container mx-auto mt-10">
      <div className="shadow-xl flex flex-col items-center justify-center bg-wedgewood-200 border-wedgewood-300 border-2 p-8">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>

        <h3 className="text-xl">
          {
            "We use Vercel Analytics and Posthog. The mobile app will still work offline, only needing the internet to download a schedule."
          }
        </h3>
      </div>
    </div>
  );
}
