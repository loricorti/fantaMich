import { useState } from 'react'
import { calciatori } from './calciatori'

type UserAProps = {
  onNameChange: (name: string) => void
  onClearName: () => void
}

function UserA({ onNameChange, onClearName }: UserAProps) {

  const [searchText, setSearchText] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filteredNames = calciatori
    .filter(name =>
      name.toLowerCase().includes(searchText.toLowerCase())
    )
    .slice(0, 10)

  function handleClearName() {
    setSearchText('')
    setShowSuggestions(false)
    onClearName()
  }

  function handleNameChange(name: string) {
    setSearchText(name)
    setShowSuggestions(false)
    onNameChange(name)
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        marginTop: '40px',
      }}
    >
      <input
        type="text"
        value={searchText}
        placeholder="Cerca un nome..."
        onChange={(event) => {
          setSearchText(event.target.value)
          setShowSuggestions(true)
        }}
        onFocus={() => {
          setShowSuggestions(true)
        }}
        style={{
          width: '100%',
          padding: '10px',
          boxSizing: 'border-box',
          border: '1px solid #cccccc',
          borderRadius: '6px',
          height: '130px',
          fontSize: '80px',
          textAlign: 'center',
        }}
      />

      {searchText && (
        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault()
          }}
          onClick={handleClearName}
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '30px',
            padding: '4px',
          }}
        >
          ×
        </button>
      )}

      {showSuggestions && filteredNames.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #cccccc',
            borderRadius: '6px',
            marginTop: '2px',
            zIndex: 10,
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {filteredNames.map((name, index) => (
            <div
              key={name}
              onClick={() => handleNameChange(name)}
              style={{
                padding: '10px',
                cursor: 'pointer',
                borderBottom: index < filteredNames.length - 1 ? '1px solid #aba6a6' : 'none',
              }}
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserA
