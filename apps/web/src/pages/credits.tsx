export default function Credits() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="shadow-2xl flex flex-col items-center justify-center bg-wedgewood-200/90 border-wedgewood-300 border-2 p-10 rounded-2xl backdrop-blur">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Credits</h1>
        <p className="mb-6">Thanks to the creators and services that make Scheduli possible.</p>

        <div className="w-full max-w-2xl space-y-4 text-base md:text-lg">
          <div className="rounded-xl border border-wedgewood-300 bg-wedgewood-100/70 p-4">
            <p className="font-semibold">Schedule Icon</p>
            <p className="text-wedgewood-900/90">
              <a
                className="underline decoration-wedgewood-500 underline-offset-2 hover:text-wedgewood-950"
                href="https://commons.wikimedia.org/wiki/File:Toicon-icon-avocado-schedule.svg"
              >
                Shannon E Thomas/toicon.com
              </a>
              ,{" "}
              <a
                className="underline decoration-wedgewood-500 underline-offset-2 hover:text-wedgewood-950"
                href="https://creativecommons.org/licenses/by/4.0"
              >
                CC BY 4.0
              </a>
              , via Wikimedia Commons
            </p>
          </div>

          <div className="rounded-xl border border-wedgewood-300 bg-wedgewood-100/70 p-4">
            <p className="font-semibold">UCI Schedule Data</p>
            <p className="text-wedgewood-900/90">
              Data from{" "}
              <a
                className="underline decoration-wedgewood-500 underline-offset-2 hover:text-wedgewood-950"
                href="https://icssc.link/about-anteaterapi"
              >
                Anteater API
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-sm md:text-base text-wedgewood-900/80">
          Created by <span className="font-semibold text-wedgewood-950">Dominic Seung</span>
        </div>
      </div>
    </div>
  );
}
