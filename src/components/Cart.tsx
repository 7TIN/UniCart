import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import EmptyState from "./EmptyState";
import Header from "./Header";
import { FilterOptions } from '../types';

const UniversalCart : React.FC = () => {
    return(
        <div className="flex flex-col h-screen bg-gray-50">
            <Header/>
            <div className="flex-1 overflow-auto p-4">
                <EmptyState type='cart' searchQuery=""/>
            </div>

        </div>
    );
};
export default UniversalCart;