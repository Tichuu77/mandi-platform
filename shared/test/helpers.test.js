const helpers = require('../utils/helpers');
beforeEach(() => {
    jest.useFakeTimers();
});

 

describe('helpers', () => {

    test('capitalize', () => {
        expect(helpers.capitalize('hello')).toBe('Hello');
    });

    test('formatDate', () => {
        const date = new Date('2026-02-16T00:00:00Z');
        expect(helpers.formatDate(date, 'YYYY-MM-DD')).toBe('2026-02-16');
    });

    test('debounce', () => {
        const func = jest.fn();
        const debouncedFunc = helpers.debounce(func, 1000);

        debouncedFunc();
        debouncedFunc();
        debouncedFunc();

        jest.advanceTimersByTime(1000);

        expect(func).toHaveBeenCalledTimes(1);
    });


    test('throttle', () => {
        const func = jest.fn();
        const throttledFunc = helpers.throttle(func, 1000);
        throttledFunc();
        throttledFunc();
        throttledFunc();
        expect(func).toHaveBeenCalledTimes(1);
    });

    test('getDateDifference', () => {
        const date1 = new Date('2023-01-01');
        const date2 = new Date('2023-02-01');
        expect(helpers.getDateDifference(date1, date2)).toBe(31);
    });

    test('truncate', () => {
        expect(helpers.truncate('Hello World', 5)).toBe('Hello...');
    });

    test('groupBy', () => {
        let arr = [
            { id: 1, gender: 'male', name: 'John' },
            { id: 2, gender: 'female', name: 'Jane' },
            { id: 3, gender: 'male', name: 'Bob' }
        ];
        expect(helpers.groupBy(arr, 'gender'))
            .toEqual(
                {
                    'male': [
                        { id: 1, gender: 'male', name: 'John' },
                        { id: 3, gender: 'male', name: 'Bob' }
                    ],
                    'female': [
                        { id: 2, gender: 'female', name: 'Jane' }
                    ]
                });
    });

    test('unique', () => {
        let arr = [1, 2, 2, 3, 4, 4, 5, 6]
        expect(helpers.unique(arr)).toEqual([1, 2, 3, 4, 5, 6])
    })

    test('sortBy asc', () => {
        let arr = [
            { id: 1, name: 'John' },
            { id: 2, name: 'Jane' },
            { id: 3, name: 'Bob' }
        ];
        expect(helpers.sortBy(arr, 'name')).toEqual([
            { id: 3, name: 'Bob' },
            { id: 2, name: 'Jane' },
            { id: 1, name: 'John' }
        ]);

    })

    test('sortBy desc', () => {
        let arr = [
            { id: 1, name: 'John' },
            { id: 2, name: 'Jane' },
            { id: 3, name: 'Bob' }
        ];
        expect(helpers.sortBy(arr, 'name', 'desc')).toEqual([
            { id: 1, name: 'John' },
            { id: 2, name: 'Jane' },
            { id: 3, name: 'Bob' }
        ]);
    })

    test('chunk', () => {
        let arr = [1, 2, 3, 4, 5, 6]
        expect(helpers.chunk(arr, 2)).toEqual([[1, 2], [3, 4], [5, 6]])
    })

    test('isEmpty', () => {
        let arr = [1, 2, 3, 4, 5, 6]
        let obj = { a: 1, b: 2, c: 3 }
        expect(helpers.isEmpty(arr)).toEqual(false)
        expect(helpers.isEmpty([])).toEqual(true)
        expect(helpers.isEmpty({})).toEqual(true)
        expect(helpers.isEmpty('')).toEqual(true)
        expect(helpers.isEmpty(null)).toEqual(true)
        expect(helpers.isEmpty(undefined)).toEqual(true)
        expect(helpers.isEmpty(0)).toEqual(false)
        expect(helpers.isEmpty(obj)).toEqual(false)
    })

    test('debounce', () => {
        jest.useFakeTimers();

        const func = jest.fn();
        const debouncedFunc = helpers.debounce(func, 1000);

        debouncedFunc();
        debouncedFunc();
        debouncedFunc();

        jest.advanceTimersByTime(1000);

        expect(func).toHaveBeenCalledTimes(1);

        jest.useRealTimers();
    });



    test('formatFileSize', () => {
        expect(helpers.formatFileSize(1024)).toBe('1 KB');
        expect(helpers.formatFileSize(1024 * 1024)).toBe('1 MB');
        expect(helpers.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    })

    test('randomElement', () => {
        let arr = [1, 2, 3, 4, 5, 6]
        let result = helpers.randomElement(arr);
        expect(arr.includes(result)).toEqual(true)
    })

    test('flatten', () => {
        let arr = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
        expect(helpers.flatten(arr)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    test('toCamelCase', () => {
        expect(helpers.toCamelCase('hello_world')).toBe('helloWorld');
        expect(helpers.toCamelCase('hello-world')).toBe('helloWorld');
        expect(helpers.toCamelCase('hello world')).toBe('helloWorld');
    })

    test('toSnakeCase', () => {
        expect(helpers.toSnakeCase('helloWorld')).toBe('hello_world');
        expect(helpers.toSnakeCase('hello-World')).toBe('hello_world');
        expect(helpers.toSnakeCase('hello World')).toBe('hello_world');
    })

    test('parseQueryString', () => {
        let url = 'https://example.com?name=John&age=30&city=New York';
        let params = helpers.parseQueryString(url);
        expect(params).toEqual({ name: 'John', age: '30', city: 'New York' });
    })

    test('slugify', () => {
        expect(helpers.slugify('hello world')).toBe('hello-world');
    })

    test('calculateAge', () => {
        const currentYear = new Date().getFullYear();
        const expectedAge = currentYear - 1990;

        expect(helpers.calculateAge('1990-01-01')).toBe(expectedAge);
    });


    test('maskString', () => {
        expect(helpers.maskString('1234567890', 4)).toBe('******7890');
    })

    test('uniqueBy', () => {
        let arr = [
            { id: 1, name: 'John' },
            { id: 2, name: 'Jane' },
            { id: 3, name: 'Bob' },
            { id: 4, name: 'John' }
        ];
        expect(helpers.uniqueBy(arr, 'name')).toEqual([
            { id: 1, name: 'John' },
            { id: 2, name: 'Jane' },
            { id: 3, name: 'Bob' }
        ]);
    })
})