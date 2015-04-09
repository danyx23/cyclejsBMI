/** @jsx dom */
const {Rx} = Cycle;
const h = Cycle.h;

// workaround for babel jsx -> hyperdom h. Babel currently does not create an array of children
// but simply creates more than 3 arguments, but vdom ignores this. This method fixes this
function dom(tag, attrs, ...children) {
	return h(tag, attrs, children);
}

Cycle.registerCustomElement("slider", (rootElement$, props) => {
	const model = function() {
		const value$ = Cycle.createStream((changeValue$, propsStartValue$) => {
						return propsStartValue$
							.merge(changeValue$);
		});
		const min$ = Cycle.createStream((propsMin$) => {
			return propsMin$.shareReplay(1);
		});
		const max$ = Cycle.createStream((propsMax$) => {
			return propsMax$.shareReplay(1);
		});
		return {
			value$,
			min$,
			max$,
			inject(props, intent) {
				value$.inject(intent.changeValue$, props.get('value$'));
				min$.inject(props.get('min$'));
				max$.inject(props.get('max$'));
				return [props, intent];
		}};
	}();

	const view = function() {
		const vtree$ = Cycle.createStream((value$, min$, max$) => {

			return Rx.Observable.combineLatest(
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
					));
		});
		return {
			vtree$,
			inject(model) {
				vtree$.inject(model.value$, model.min$, model.max$);
				return model;
			}
		};
	}();

	function parseValue(val) {
		const parsed = parseInt(val, 10);
		return parsed;
	}

	const user = (function () {
		return {
			interactions$: rootElement$.interactions$,
			inject(view) {
				rootElement$.inject(view.vtree$);
				return view;
			}
		};
	})();

	const intent = (function () {
			const changeSlider$ = Cycle.createStream(interactions$ =>
				interactions$.choose("[type=range]", "input")
				.map(event => parseValue(event.target.value)));

			const changeInput$ = Cycle.createStream(interactions$ =>
				interactions$.choose("[type=text]", "input")
				.map(event => parseValue(event.target.value))
				.filter(val => !Number.isNaN(val)));
			return {
				changeSlider$,
				changeInput$,
				changeValue$: Rx.Observable.merge(changeSlider$, changeInput$),
				inject(user) {
					changeSlider$.inject(user.interactions$);
					changeInput$.inject(user.interactions$);
					return user;
				}
			};
	})();

	user.inject(view).inject(model).inject(props, intent)[1].inject(user);

	return {
		changeValue$: intent.changeValue$.tap(x => console.log("slider changed to: " + x))
	};
});

const model = (function () {
	const height$ = Cycle.createStream(changeHeight$ => {
		return changeHeight$.startWith(175);
	});
	const mass$ = Cycle.createStream(changeMass$ => {
		return changeMass$.startWith(75);
	});
	return {
		height$,
		mass$,
		inject(intent) {
			height$.inject(intent.changeHeight$);
			mass$.inject(intent.changeMass$);
			return intent;
		}
	}
})();

const calculateBMI = (height, mass) =>	{
	console.log('bmi', height, mass);
 	return Math.round(mass / Math.pow(height / 100, 2));
};

const view = (function () {
	const vtree$ = Cycle.createStream((height$, mass$) => {
		return Rx.Observable.combineLatest(
		height$,
		mass$,
		(height, mass) => (
			<div class={"everything"}>
				<div>
					<slider className="slider-height" value={height} min={130} max={220} key={1}/>
					<slider className="slider-mass" value={mass} min={25} max={150} key={2}/>
				</div>
				<div>
					Your BMI is: {"" + calculateBMI(height, mass)}
				</div>
			</div>
		)
		)});
	return {
		vtree$,
		inject(model) {
			vtree$.inject(model.height$, model.mass$);
			return model;
		}
	}
})();

const user = (function () {
	const interactions$ = Cycle.createStream(function (vtree$) {
		return Cycle.render(vtree$, '.app').interactions$;
	});
	return {
		interactions$,
		inject(view) {
			interactions$.inject(view.vtree$);
			return view;
		}
	};
})();

const intent = (function() {
	const changeHeight$ = Cycle.createStream(interactions$ => {
		return interactions$.choose('.slider-height', 'changeValue').map(event => event.data);
	});
	const changeMass$ = Cycle.createStream(interactions$ => {
		return interactions$.choose('.slider-mass', 'changeValue').map(event => event.data);
	});
	return {
		changeHeight$,
		changeMass$,
		inject(user) {
			changeHeight$.inject(user.interactions$);
			changeMass$.inject(user.interactions$);
			return user;
		}
	};
})();

user.inject(view).inject(model).inject(intent).inject(user);
