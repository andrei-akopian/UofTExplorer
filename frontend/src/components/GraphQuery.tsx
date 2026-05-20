import { useState } from "react";
import SearchBar from "./SearchBar";

import {fetchGraphData} from "../lib/api";
import type { GraphData } from "../types";


export default function GraphQuery({data, setData, isLoading, setIsLoading}: {data: GraphData, setData: (data: GraphData) => void, isLoading: boolean, setIsLoading: (isLoading: boolean) => void}) {
    const [query, setQuery] = useState<string>('');
    const [filters, setFilters] = useState<Object>({});

    return (
        <div>
            <SearchBar query={query} setQuery={setQuery} filtersHook={filters} setFiltersHook={setFilters} />
        </div>
    )
}






