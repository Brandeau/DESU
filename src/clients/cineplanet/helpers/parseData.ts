export function parseData(list: any[], ...props: string[]): any[]{

    const parsed = [];

    list.forEach(listElem => {
        const innerObject = {};

        props.forEach(prop => {
    
            Object.defineProperty(innerObject, prop, {
                enumerable: true,
                configurable: true,
                writable: true,
                value: listElem[prop],
              });
        });

        parsed.push(innerObject);
    });

    return parsed;
}