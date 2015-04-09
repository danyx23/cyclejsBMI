/** @jsx dom */
const {Rx} = Cycle;
const h = Cycle.h;

// workaround for babel jsx -> hyperdom h. Babel currently does not create an array of children
// but simply creates more than 3 arguments, but vdom ignores this. This method fixes this
function dom(tag, attrs, ...children) {
  return h(tag, attrs, children);
}

// register custom slider element that displays a label, a slider and an editable numeric field
Cycle.registerCustomElement("slider", (rootElement$, props) => {
  const model = function() {
    const value$ = Cycle.createStream((changeValue$, propsStartValue$) =>
                      propsStartValue$.merge(changeValue$));
    const min$ = Cycle.createStream((propsMin$) => propsMin$.shareReplay(1));
    const max$ = Cycle.createStream((propsMax$) => propsMax$.shareReplay(1));
    const label$ = Cycle.createStream((propsLabel$) => propsLabel$.shareReplay(1));
    return {
      value$,
      min$,
      max$,
      label$,
      inject(props, intent) {
        value$.inject(intent.changeValue$, props.get('value$'));
        min$.inject(props.get('min$'));
        max$.inject(props.get('max$'));
        label$.inject(props.get('label$'));
        return intent;
    }};
  }();

  const view = function() {
    const vtree$ = Cycle.createStream((value$, min$, max$, label$) =>
      Rx.Observable.combineLatest(
          value$,
          min$,
          max$,
          label$,
          (value, min, max, label) => (
            <div class="form-group">
              <label>{label}</label>
              <div className="input-group">
                <input className="form-control" type="range" value={value} min={min} max={max}/>
                <div className="input-group-addon">
                  <input type="text" value={value}/>
                </div>
              </div>
            </div>
          ))
    );
    return {
      vtree$,
      inject(model) {
        vtree$.inject(model.value$, model.min$, model.max$, model.label$);
        return model;
      }
    };
  }();

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
          .map(event => parseInt(event.target.value, 10)));

	    // here we want to filter invalid values so they don't get pushed into the stream and the user can correct them.
	    // alternatively we could make a stream of objects that have the parsed value or an error message, but since this
	    // is a simple example, this will do.
      const changeInput$ = Cycle.createStream(interactions$ =>
        interactions$.choose("[type=text]", "input")
          .map(event => parseInt(event.target.value, 10))
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

	// wire up everything
  user.inject(view).inject(model).inject(props, intent).inject(user);

	// expose only the changeValue$ stream to the outside.
	// tap is used to log changes in the value to the console.
  return {
    changeValue$: intent.changeValue$.tap(x => console.log("slider changed to: " + x))
  };
});

const model = (function () {
  const height$ = Cycle.createStream(changeHeight$ => changeHeight$.startWith(175));
  const mass$ = Cycle.createStream(changeMass$ => changeMass$.startWith(75));
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

function calculateBMI (height, mass) {
  console.log('bmi', height, mass);
  return Math.round(mass / Math.pow(height / 100, 2));
};

const view = (function () {
  const vtree$ = Cycle.createStream((height$, mass$) => {
    return Rx.Observable.combineLatest(
    height$,
    mass$,
    (height, mass) => (
      <div>
        <div>
          <slider className="slider-height" label="Height (in cm):" value={height} min={130} max={220} key={1}/>
          <slider className="slider-mass" label="Weight (in kg): " value={mass} min={25} max={150} key={2}/>
        </div>
        <div>
          Your BMI is: {String(calculateBMI(height, mass))}
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
  const interactions$ = Cycle.createStream(vtree$ => Cycle.render(vtree$, '.app').interactions$);
  return {
    interactions$,
    inject(view) {
      interactions$.inject(view.vtree$);
      return view;
    }
  };
})();

const intent = (function() {
  const changeHeight$ = Cycle.createStream(interactions$ => interactions$.choose('.slider-height', 'changeValue').map(event => event.data));
  const changeMass$ = Cycle.createStream(interactions$ => interactions$.choose('.slider-mass', 'changeValue').map(event => event.data));
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

// wire everything together
user.inject(view).inject(model).inject(intent).inject(user);
