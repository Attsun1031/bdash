import Store from "./Store";

export default {
  create<T>(Component: React.ComponentClass<{}, T>, store: Store<T>) {
    return class Container extends Component {
      _unsubscribe: any;

      constructor(...args) {
        // @ts-ignore
        super(...args);
        this.state = store.state;
        this._unsubscribe = store.subscribe((state: T) => this.setState(state));
      }

      componentWillUnmount() {
        if (super.componentWillUnmount) {
          super.componentWillUnmount();
        }

        this._unsubscribe();
      }
    };
  }
};
