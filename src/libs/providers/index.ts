import APDataProvider from "./APDataProvider";
import DBDataProvider from "./DBDataProvider";
import MTDataProvider from "./MTDataProvider";

export default {
    [DBDataProvider.sourceName]: DBDataProvider,
    [MTDataProvider.sourceName]: MTDataProvider,
    [APDataProvider.sourceName]: APDataProvider,
};

export * from "./DataProvider";
