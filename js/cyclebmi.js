/** @jsx dom */
const Cycle = require("cyclejs");
const {Rx} = Cycle;
const h = Cycle.h;

// workaround for babel jsx -> hyperdom h. Babel currently does not create an array of children
// but simply creates more than 3 arguments, but vdom ignores this. This method fixes this
function dom(tag, attrs, ...children) { // dom - the name after @jsx, put whatever you want
	return h(tag, attrs, children);
}

Cycle.registerCustomElement("slider", (User, Props) => {
	const Model = Cycle.createModel((Intent, Props) => ({
		value$: Props.get("value$").startWith(0)
		.merge(Intent.get("changeValue$"))
	}));

	const View = Cycle.createView(Model => {
		const value$ = Model.get("value$");
		return {
			vtree$: value$.map(value => (
				<div class="form-group">
					<label>Amount</label>
					<div class="input-group">
						<input type="range" value={value} min={Props.get("min$").single()} max={Props.get("max$").single()} placeholder="Amount"/>
						<div class="input-group-addon">
							<input type="text" value={value} readonly="1"/>
						</div>
					</div>
				</div>
				))
		};
	});
	const Intent = Cycle.createIntent(User => {
		return {
			changeValue$: User.event$("[type=range]", "input")
			.map(event => parseInt(event.target.value))
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
					<slider class="slider-height" value={height} min={130} max={220}/>
					<slider class="slider-mass" value={mass} min={25} max={150}/>
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
		changeHeight$: User.event$(".slider-height", "changeValue").map(event => event.data).tap(height => console.log("height changed to: " + height)),
		changeMass$: User.event$(".slider-mass", "changeValue").map(event => event.data)
	};
});


const User = Cycle.createDOMUser(".app");

User.inject(View).inject(Model).inject(Intent).inject(User);
