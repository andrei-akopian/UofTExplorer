import { useState, useEffect } from 'react';
import { getDepartments } from '../lib/api';
import SearchQueryBar from './SearchQueryBar';


const breadths = [
    'Creative and Cultural Representations (1)',
    'Thought, Belief, and Behaviour (2)',
    'Society and its Institutions (3)',
    'Living Things and Their Environment (4)',
    'The Physical and Mathematical Universes (5)'
]


function FilterBar({title, options, filtersHook, setFiltersHook, filtersTitle, keyFormat}: {title: string, options: string[], filtersHook: Object, setFiltersHook: (filtersHook: Object) => void, filtersTitle: string, keyFormat: (option: string) => string}) {

    function handleChange(e: React.ChangeEvent<HTMLInputElement>, key: string) {
        console.log(`Toggled ${key}: ${e.target.checked}`)
        const index = filtersHook[filtersTitle].indexOf(key)
        if (e.target.checked && index === -1) {
            setFiltersHook({
                ...filtersHook,
                [filtersTitle]: [...filtersHook[filtersTitle], key]
            })
        } else if (!e.target.checked && index !== -1) {
            setFiltersHook({
                ...filtersHook,
                [filtersTitle]: filtersHook[filtersTitle].filter((k: string) => k != key)
            })
        }
    }

    return (
        <details className="close-on-outclick relative">
            <summary style={{ 
                listStyle: 'none',
                cursor: 'pointer',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                background: '#fff',
                userSelect: 'none'
            }}>{title}</summary>
            <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: '0',
                zIndex: '1200',
                width: '20em',
                maxHeight: '20em',
                overflowY: 'scroll',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '10px',
                background: 'white',
                border: '1px solid #ccc',
                borderRadius: '6px',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.16)'
            }}>
                {options.map(option => (
                    <label key={keyFormat(option)} style={{
                        width: 'max-content',
                        minWidth: '5em',
                        maxHeight: 'none',
                        overflow: 'visible'
                    }}>
                        <input type="checkbox" onChange={(e) => handleChange(e, keyFormat(option))} />
                        <span>{option}</span>
                    </label>
                ))}
            </div>
        </details>
    )
}


interface SearchBarProps {
    query: string;
    setQuery: (q: string) => void;
    filtersHook: Object;
    setFiltersHook: (filtersHook: Object) => void;
}


export default function SearchBar({ query, setQuery, filtersHook, setFiltersHook }: SearchBarProps) {
    const [departments, setDepartments] = useState<string[]>([]);

    useEffect(() => {
        setFiltersHook({
            cr_ncr: [],
            departments: [],
            breadth_requirements: []
        });
        },
        []
    );

    useEffect(() => {
        getDepartments().then(departments => {
            const departmentList: string[] = []
            for (const dept in departments) {
                departmentList.push(`${dept} (${departments[dept]})`)
            }
            setDepartments(departmentList)
        });
    }, [])

    return (
        <div className="flex">
            <SearchQueryBar query={query} setQuery={setQuery} />
            <FilterBar title="CR / NCR" options={['Eligible', 'Ineligible']} filtersHook={filtersHook} setFiltersHook={setFiltersHook} filtersTitle='cr_ncr' keyFormat={(option) => option.toLowerCase()} />
            <FilterBar title="Departments" options={departments} filtersHook={filtersHook} setFiltersHook={setFiltersHook} filtersTitle='departments' keyFormat={(option) => option.slice(0, 3)} />
            <FilterBar title="Breadth Requirements" options={breadths} filtersHook={filtersHook} setFiltersHook={setFiltersHook} filtersTitle='breadth_requirements' keyFormat={(option) => option.at(-2)} />
        </div>
    )
}







