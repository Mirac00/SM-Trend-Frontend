// FilterComponent.tsx
import React, { useState } from 'react';

interface FilterComponentProps {
  onFilterChange: (filter: { fileType: string; searchTerm: string; sortOption: string }) => void;
}

function FilterComponent({ onFilterChange }: FilterComponentProps) {
  const [fileType, setFileType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('latest'); // Domyślna opcja sortowania

  const handleFileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFileType = e.target.value;
    setFileType(newFileType);
    onFilterChange({ fileType: newFileType, searchTerm, sortOption });
  };

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    onFilterChange({ fileType, searchTerm: newSearchTerm, sortOption });
  };

  const handleSortOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortOption = e.target.value;
    setSortOption(newSortOption);
    onFilterChange({ fileType, searchTerm, sortOption: newSortOption });
  };

  return (
    <div className="mb-3">
      <label htmlFor="fileType" className="form-label">Typ pliku</label>
      <select id="fileType" className="form-select" value={fileType} onChange={handleFileTypeChange}>
        <option value="">Wszystkie</option>
        <option value="image/">Obraz</option>
        <option value="video/">Wideo</option>
        <option value="audio/">Audio</option>
      </select>

      <label htmlFor="searchTerm" className="form-label mt-3">Szukaj</label>
      <input
        type="text"
        id="searchTerm"
        className="form-control"
        value={searchTerm}
        onChange={handleSearchTermChange}
        placeholder="Szukaj po tytule, treści lub nazwie pliku"
      />

      <label htmlFor="sortOption" className="form-label mt-3">Sortuj według</label>
      <select id="sortOption" className="form-select" value={sortOption} onChange={handleSortOptionChange}>
        <option value="latest">Najnowsze</option>
        <option value="highestRated">Najwyżej oceniane</option>
        <option value="lowestRated">Najniżej oceniane</option>
        <option value="alphabetical">Alfabetycznie po tytule</option>
      </select>
    </div>
  );
}

export default FilterComponent;
