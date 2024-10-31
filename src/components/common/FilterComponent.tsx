// FilterComponent.tsx
import React, { useState } from 'react';

interface FilterComponentProps {
  onFilterChange: (filter: { fileType: string; searchTerm: string; sortOption: string; category: string }) => void;
}

function FilterComponent({ onFilterChange }: FilterComponentProps) {
  const [fileType, setFileType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('latest'); // Domyślna opcja sortowania
  const [category, setCategory] = useState(''); // Nowy stan dla kategorii

  const handleFileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFileType = e.target.value;
    setFileType(newFileType);
    onFilterChange({ fileType: newFileType, searchTerm, sortOption, category });
  };

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    onFilterChange({ fileType, searchTerm: newSearchTerm, sortOption, category });
  };

  const handleSortOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortOption = e.target.value;
    setSortOption(newSortOption);
    onFilterChange({ fileType, searchTerm, sortOption: newSortOption, category });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    onFilterChange({ fileType, searchTerm, sortOption, category: newCategory });
  };

  return (
    <div className="mb-3">
      <label htmlFor="searchTerm" className="form-label">Szukaj</label>
      <input
        type="text"
        id="searchTerm"
        className="form-control"
        value={searchTerm}
        onChange={handleSearchTermChange}
        placeholder="Szukaj po tytule, treści lub nazwie pliku"
      />

      <label htmlFor="fileType" className="form-label mt-3">Typ pliku</label>
      <select id="fileType" className="form-select" value={fileType} onChange={handleFileTypeChange}>
        <option value="">Wszystkie</option>
        <option value="image/">Obraz</option>
        <option value="video/">Wideo</option>
        <option value="audio/">Audio</option>
      </select>

      <label htmlFor="sortOption" className="form-label mt-3">Sortuj według</label>
      <select id="sortOption" className="form-select" value={sortOption} onChange={handleSortOptionChange}>
        <option value="latest">Najnowsze</option>
        <option value="highestRated">Najwyżej oceniane</option>
        <option value="lowestRated">Najniżej oceniane</option>
        <option value="alphabetical">Alfabetycznie po tytule</option>
      </select>

      <label htmlFor="category" className="form-label mt-3">Kategoria</label>
      <select id="category" className="form-select" value={category} onChange={handleCategoryChange}>
        <option value="">Wszystkie</option>
        <option value="Edukacyjne">Edukacyjne</option>
        <option value="Rozrywkowe">Rozrywkowe</option>
        <option value="Inspirujące">Inspirujące</option>
        <option value="Promocyjne">Promocyjne</option>
        <option value="Użytkowników (UGC)">Użytkowników (UGC)</option>
        <option value="Kulturalne">Kulturalne</option>
        <option value="Wizualne">Wizualne</option>
        <option value="Personalne / Zakulisowe">Personalne / Zakulisowe</option>
        <option value="Interaktywne">Interaktywne</option>
        <option value="Aktualności / Informacyjne">Aktualności / Informacyjne</option>
      </select>
    </div>
  );
}

export default FilterComponent;
