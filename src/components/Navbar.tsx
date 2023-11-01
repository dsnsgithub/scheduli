import Link from "next/link";
import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faCalendarDays, faCircleInfo, faComment, faHome } from "@fortawesome/free-solid-svg-icons";
import { faCreativeCommonsBy } from "@fortawesome/free-brands-svg-icons";

export default function Navbar() {
	const [currentDate, setCurrentDate] = React.useState(new Date());
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => {
		setCurrentDate(new Date());
		setIsLoading(false);

		const interval = setInterval(() => {
			setCurrentDate(new Date());
			setIsLoading(false);
		}, 1000); // Update every second, or adjust as needed

		// Clean up the interval when the component unmounts
		return () => clearInterval(interval);
	}, []);

	return (
		<nav className="flex justify-around items-center mt-8 py-4 px-4">
			<Link className="flex items-center" href="/">
				{/* if you don't do this, vercel will auto optimize and ruin it */}
				{isLoading ? <></> : <img src={`/dynamic/scheduli${currentDate.getDate()}.png`} alt="Scheduli Icon" width="80" />}
				<h1 className="px-4 text-4xl font-bold hidden lg:inline">Scheduli</h1>
			</Link>

			<div>
				<Link className="px-2 md:px-5 lg:px-6" href="/">
					<FontAwesomeIcon icon={faHome} size="xl" />
				</Link>
				<Link className="px-2 md:px-5 lg:px-6" href="/about">
					<FontAwesomeIcon icon={faCircleInfo} size="xl" />
				</Link>
				<Link className="px-2 md:px-5 lg:px-6" href="/create">
					<FontAwesomeIcon icon={faCalendarDays} size="xl" />
				</Link>
				<Link className="px-2 md:px-5 lg:px-6" href="/credits">
					<FontAwesomeIcon icon={faCreativeCommonsBy} size="xl" />
				</Link>
				<Link className="px-2 md:px-5 lg:px-6" href="/feedback">
					<FontAwesomeIcon icon={faComment} size="xl" />
				</Link>
				<Link className="px-2 md:px-5 lg:px-6" href="/privacy">
					<FontAwesomeIcon icon={faBook} size="xl" />
				</Link>
			</div>
		</nav>
	);
}
