export type Unit = {
    system: 'metric' | 'imperial'
    name: [string, string]
    abbr: [string, string]
    base: string | true
    multiplier?: number
}

export const units: Unit[] = [
    { system: 'metric', name: ['milliliter', 'milliliters'], abbr: ['ml', 'ml'], base: true },
    {
        system: 'metric',
        name: ['liter', 'liters'],
        abbr: ['l', 'l'],
        base: 'milliliter',
        multiplier: 1000
    },

    {
        system: 'metric',
        name: ['milligram', 'milligrams'],
        abbr: ['mg', 'mg'],
        base: 'gram',
        multiplier: 0.001
    },
    { system: 'metric', name: ['gram', 'grams'], abbr: ['g', 'g'], base: true },
    {
        system: 'metric',
        name: ['kilogram', 'kilograms'],
        abbr: ['kg', 'kg'],
        base: 'gram',
        multiplier: 1000
    },

    {
        system: 'imperial',
        name: ['ounce', 'ounces'],
        abbr: ['oz', 'oz'],
        base: 'gram',
        multiplier: 28.3495231247
    },
    {
        system: 'imperial',
        name: ['pound', 'pounds'],
        abbr: ['lb', 'lbs'],
        base: 'gram',
        multiplier: 453.592369995
    },

    {
        system: 'imperial',
        name: ['teaspoon', 'teaspoons'],
        abbr: ['tsp.', 'tsps'],
        base: 'milliliter',
        multiplier: 4.9289215938
    },
    {
        system: 'imperial',
        name: ['tablespoon', 'tablespoons'],
        abbr: ['tbsp', 'tbsps'],
        base: 'milliliter',
        multiplier: 14.7867647814
    },
    {
        system: 'imperial',
        name: ['fluid ounce', 'fluid ounces'],
        abbr: ['fl oz', 'fl oz'],
        base: 'milliliter',
        multiplier: 29.5735295628
    },
    {
        system: 'imperial',
        name: ['cup', 'cups'],
        abbr: ['cup', 'cups'],
        base: 'milliliter',
        multiplier: 236.588236502
    },
    // { system: 'imperial', name: ['pint', 'pints'], abbr: ['pint', 'pints'], base: true },
    // { system: 'imperial', name: ['quart', 'quarts'], abbr: ['quart', 'quarts'], base: true },
    {
        system: 'imperial',
        name: ['gallon', 'gallons'],
        abbr: ['gallon', 'gallons'],
        base: 'milliliter',
        multiplier: 3785.41178403
    },


]