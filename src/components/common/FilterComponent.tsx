import React, { useState } from 'react';

interface FilterComponentProps {
  onFilterChange: (filter: { fileType: string; searchTerm: string }) => void;
}

function FilterComponent({ onFilterChange }: FilterComponentProps) {
  const [fileType, setFileType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFileType(e.target.value);
    onFilterChange({ fileType: e.target.value, searchTerm });
  };

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onFilterChange({ fileType, searchTerm: e.target.value });
  };

  return (
    <div className="mb-3">
      <label htmlFor="fileType" className="form-label">File Type</label>
      <select id="fileType" className="form-select" value={fileType} onChange={handleFileTypeChange}>
        <option value="">All</option>
        <option value="image/">Image</option>
        <option value="video/">Video</option>
        <option value="audio/">Audio</option>
      </select>

      <label htmlFor="searchTerm" className="form-label mt-3">Search</label>
      <input
        type="text"
        id="searchTerm"
        className="form-control"
        value={searchTerm}
        onChange={handleSearchTermChange}
        placeholder="Search by title, content or file name"
      />
    </div>
  );
}

export default FilterComponent;
