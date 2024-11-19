import APDataProvider from "./APDataProvider";
import DADataProvider from "./DADataProvider";
import DBDataProvider from "./DBDataProvider";
import MTDataProvider from "./MTDataProvider";

export default {
    [DBDataProvider.sourceName]: DBDataProvider,
    [APDataProvider.sourceName]: APDataProvider,
    [MTDataProvider.sourceName]: MTDataProvider,
    [DADataProvider.sourceName]: DADataProvider,
};

export * from "./DataProvider";
