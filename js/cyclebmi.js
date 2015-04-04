/** @jsx dom */
const Cycle = require("cyclejs");
const {Rx} = Cycle;
const h = Cycle.h;

// workaround for babel jsx -> hyperdom h. Babel currently does not create an array of children
// but simply creates more than 3 arguments, but vdom ignores this. This method fixes this
function dom(tag, attrs, ...children) {
	return h(tag, attrs, children);
}

Cycle.registerCustomElement("slider", (User, Props) => {
	const Model = Cycle.createModel((Intent, Props) => ({
		value$: Props.get("value$").startWith(0)
		.merge(Intent.get("changeValue$"))
	}));

	const View = Cycle.createView(Model => {
		const value$ = Model.get("value$");
		const min$ = Props.get("min$");
		const max$ = Props.get("max$");
		return {
			vtree$: Rx.Observable.combineLatest(
				value$,
				min$,
				max$,
				(value, min, max) => (
				<div class="form-group">
					<label>Amount</label>
					<div className="input-group">
						<input className="form-control" type="range" value={value} min={min} max={max}/>
						<div className="input-group-addon">
							<input type="text" value={value}/>
						</div>
					</div>
				</div>
				))
		};
	});

	function parseValue(val) {
		const parsed = parseInt(event.target.value, 10);
		return parsed;
	}

	const Intent = Cycle.createIntent(User => {
		const changeSlider$ = User.event$("[type=range]", "input")
			.map(event => parseValue(event.target.value));

		const changeInput$ = User.event$("[type=text]", "input")
			.map(event => parseValue(event.target.value))
			.filter(val => !Number.isNaN(val));
		return {
			changeSlider$,
			changeInput$,
			changeValue$: Rx.Observable.merge(changeSlider$, changeInput$)
		};
	});
	User.inject(View).inject(Model).inject(Intent, Props)[0].inject(User);
	return {
		changeValue$: Intent.get("changeValue$").tap(x => console.log("slider changed to: " + x))
	};
});

const Model = Cycle.createModel(Intent => {
	return {
		height$: Intent.get("changeHeight$").startWith(175),
		mass$: Intent.get("changeMass$").startWith(75)
	};
});

const calculateBMI = (height, mass) =>	{
	console.log('bmi', height, mass);
 	return Math.round(mass / Math.pow(height / 100, 2));
};

const View = Cycle.createView(Model => {
	return {
		vtree$: Rx.Observable.combineLatest(
		Model.get("height$"),
		Model.get("mass$"),
		(height, mass) => (
			<div class={"everything"}>
				<div>
					<slider className="slider-height" value={height} min={130} max={220}/>
					<slider className="slider-mass" value={mass} min={25} max={150}/>
				</div>
				<div>
					Your BMI is: {"" + calculateBMI(height, mass)}
				</div>
			</div>
		)
		)}
	}
);

const Intent = Cycle.createIntent(User => {
	return {
		changeHeight$: User.event$(".slider-height", "changeValue").map(event => event.data),
		changeMass$: User.event$(".slider-mass", "changeValue").map(event => event.data)
	};
});


const User = Cycle.createDOMUser(".app");

User.inject(View).inject(Model).inject(Intent).inject(User);
