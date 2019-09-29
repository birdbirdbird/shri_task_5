const state = {
  all: ['api', 'packages'],
  active: ['api', 'packages']
}

const searchAction = (active) => ({
  type: 'SEARCH',
  payload: active
});

class Store {
  constructor(reducer) {
    this._reducer = reducer;
    this._state = state;
    this._listeners = [];
  }

  getState() {
    return this._state;
  }

  subscribe(cb) {
    this._listeners.push(cb);
    return () => {
      const index = this._listeners.indexOf(cb);
      this._listeners.splice(index, 1);
    };
  }
  
  dispatch(action) {
    this._state = this._reducer(this._state, action);
    this._notifyListeners();
  }

  _notifyListeners() {
    this._listeners.forEach((listener) => {
      listener(this._state);
    });
  }
}


class View {
  constructor(el, store) {
    this._el = el;
    this._store = store;
    this._unsubscribe = store.subscribe(
      this._prepareRender.bind(this)
    );
    this._prepareRender(store.getState());
    
  }

  _prepareRender(state) {
    this.render(state);
  }

  render() {
    throw new Error('This method should be overriden');
  }
}

class UserView extends View {
  constructor(el, store) {
    super(el, store);
    this._onInput = this._onInput.bind(this);
    this._el.addEventListener('change', this._onInput);
    this.files = document.querySelectorAll('.table__row');
  }

  _onInput(event) {
    this._store.dispatch(searchAction(event.target.value));
  }
  
  render({ active }) {
    if (this.files) {
      this.files.forEach(elem => {
        if (active.length !=0 && active.includes(elem.getAttribute('data-filename'))) {
          elem.setAttribute('data-visibility', 'true')
        } else {
          elem.setAttribute('data-visibility', 'false')
        }
      })  
    }  
  }
}


const reducer = (state, action) => {
  switch (action.type) {
  case 'SEARCH':
    let active = []
    state.all.forEach(elem => {
      if (elem.substr(0, action.payload.length).match(action.payload)) {
        active.push(elem)
      }
    })
    return {
      ...state,
      active: active
    }
  default:
    return {
      ...state,
    };
  }
}

const searchInput = document.querySelector('.header__search');
const store = new Store(reducer);
const view = new UserView(searchInput, store);
