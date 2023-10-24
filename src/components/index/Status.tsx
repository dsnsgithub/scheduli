export default function Status(props: { time: string; className: string; timeRange: string }) {
	return (
		<div className="flex items-center justify-center flex-col shadow-xl rounded-lg p-10 lg:p-24 bg-wedgewood-200 border-wedgewood-300 border-2 text-center">
			<h3 className="text-7xl font-bold">{props.time}</h3>
			<h4 className="text-2xl mt-4">{props.className}</h4>
			<h4 className="mt-4">{props.timeRange}</h4>
		</div>
	);
}
