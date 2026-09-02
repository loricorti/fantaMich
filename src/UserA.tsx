import { useState } from 'react'
import { portieri } from './liste/portieri'
import { difensori } from './liste/difensori'
import { centrocampisti } from './liste/centrocampisti'
import { attaccanti } from './liste/attaccanti'

type UserAProps = {
    onNameChange: (name: string) => void
    onClearName: () => void
}

function UserA({ onNameChange, onClearName }: UserAProps) {
    const [selectedCategory, setSelectedCategory] = useState('Portieri')

    const [searchText, setSearchText] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)

    const filteredNames = selectedCategory === 'Portieri' ? portieri :
        selectedCategory === 'Difensori' ? difensori :
        selectedCategory === 'Centrocampisti' ? centrocampisti :
        attaccanti
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
        <div>
            <fieldset
                style={{
                    border: 'none',
                    padding: 0,
                    margin: '0 0 16px 0',
                }}
            >
                <legend
                    style={{
                        fontSize: '28px',
                        marginBottom: '10px',
                    }}
                >
                    Categoria
                </legend>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '50px',
                    }}
                >
                    {['Portieri', 'Difensori', 'Centrocampisti', 'Attaccanti'].map((category) => (
                        <label
                            key={category}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontSize: '32px',
                            }}
                        >
                            <input
                                type="radio"
                                name="category"
                                value={category}
                                checked={selectedCategory === category}
                                onChange={(event) => {
                                    setSelectedCategory(event.target.value)
                                    setSearchText('')
                                    setShowSuggestions(false)
                                }}
                                style={{
                                    width: '26px',
                                    height: '26px',
                                    cursor: 'pointer',
                                }}
                            />

                            {category}
                        </label>
                    ))}
                </div>
            </fieldset>

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
                        height: '80px',
                        fontSize: '40px',
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
        </div>
    )
}

export default UserA
