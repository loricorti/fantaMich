import { useEffect, useState } from 'react'
import { supabase } from './supabase'

const names = [
  'Mario',
  'Luca',
  'Stefano',
  'Andrea',
]

function App() {

  const [selectedName, setSelectedName] = useState('')
  const [number, setNumber] = useState(0)
  const [locked, setLocked] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const filteredNames = names
    .filter(name =>
      name.toLowerCase().includes(searchText.toLowerCase())
    )
    .slice(0, 10)

  const params = new URLSearchParams(window.location.search)
  const role = params.get('role')

  const isUserA = role === 'A'
  const isUserB = role === 'B'

  useEffect(() => {

    // Caricamento iniziale
    async function loadState() {

      const { data, error } = await supabase
        .from('shared_state')
        .select('*')
        .eq('id', 1)
        .single()

      if (error) {
        console.error('Error loading state:', error)
        return
      }

      setSelectedName(data.selected_name)
      setNumber(data.number_value)
      setLocked(data.locked)
    }

    loadState()

    console.log('Starting realtime subscription...')
    // Realtime
    const channel = supabase
      .channel('shared-state')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shared_state',
        },
        (payload) => {

          console.log('REALTIME UPDATE:', payload.new)

          const state = payload.new as {
            id: number
            selected_name: string
            number_value: number
            locked: boolean
          }

          setSelectedName(state.selected_name)
          setNumber(state.number_value)
          setLocked(state.locked)
        }
      )
      .subscribe((status) => {
        console.log('REALTIME STATUS:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }

  }, [])


  // Cambio nome
  async function handleNameChange(name: string) {

    setSelectedName(name)
    setSearchText(name)
    setNumber(0)
    setLocked(false)

    const { error } = await supabase
      .from('shared_state')
      .update({
        selected_name: name,
        number_value: 0,
        locked: false,
      })
      .eq('id', 1)

    if (error) {
      console.error('Error updating state:', error)
    }
  }

  async function handleClearName() {

    setSelectedName('')
    setSearchText('')
    setNumber(0)
    setLocked(false)
    setShowSuggestions(false)

    const { error } = await supabase
      .from('shared_state')
      .update({
        selected_name: '',
        number_value: 0,
        locked: false,
      })
      .eq('id', 1)

    if (error) {
      console.error('Error clearing name:', error)
    }
  }


  // Cambio numero
  async function handleNumberChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const value = Number(event.target.value)

    setNumber(value)

    const { error } = await supabase
      .from('shared_state')
      .update({
        number_value: value,
      })
      .eq('id', 1)

    if (error) {
      console.error('Error updating number:', error)
    }
  }


  // Conferma
  async function handleConfirm() {

    const { error } = await supabase
      .from('shared_state')
      .update({
        locked: true,
      })
      .eq('id', 1)

    if (error) {
      console.error('Error locking:', error)
    }
  }


  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
      }}>

      <div style={{
        maxWidth: '800px',
        marginLeft: '50px',
        marginRight: '50px',
        paddingLeft: '60px',
        paddingRight: '60px',
        paddingTop: '20px',
        paddingBottom: '20px',
        backgroundColor: '#9af6c0',
      }}>

        <h1 style={{ marginBottom: '60px' }}>Asta di Michelangelo Tentori</h1>

        <div style={{ marginBottom: '60px' }}>

          <label style={{
            fontSize: '30px',
            marginBottom: '30px',
          }}>
            Giocatore
          </label>

          <br />

          {isUserA ? (
            <div
              style={{
                position: 'relative',
                width: '100%',
                marginTop: '5px',
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
                  height: '50px',
                  fontSize: '22px',
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
                      onClick={() => {
                        handleNameChange(name)
                        setSearchText(name)
                        setShowSuggestions(false)
                      }}
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
          ) : (
            <p
              style={{
                margin: '5px 0 0 0',
                padding: '10px',
                fontSize: '40px',
                color: '#000000',
                fontWeight: 'bold',
              }}
            >
              {selectedName}
            </p>
          )}
        </div>


        <div style={{ marginBottom: '20px' }}>

          <label style={{
            fontSize: '30px',
            marginBottom: '20px',
          }}>
            Valore offerto
          </label>

          {isUserA ? (
            <label style={{
              fontSize: '30px',
              marginLeft: '20px',
            }}>
              {number}M
            </label>
          ) : (
            <div>
              <br />

              <input
                type="number"
                value={number}
                disabled={!isUserB || locked}
                onChange={handleNumberChange}
                style={{
                  width: '100.px',
                  backgroundColor: locked ? '#3a3a3a' : '#ffffff',
                  color: locked ? '#ffffff' : '#000000',
                  border: locked ? '1px solid #555555' : '1px solid #cccccc',
                  borderRadius: '6px',
                  cursor: locked ? 'not-allowed' : 'text',
                  opacity: 1,
                  height: '50px',
                  fontSize: '22px',
                  textAlign: 'center'
                }}

              />
            </div>
          )}
        </div>

        {isUserB && (
          <button
            onClick={handleConfirm}
            disabled={!isUserB || locked}
            style={{
              height: '60px',
              width: '100px',
              fontSize: '20px',
              marginTop: '20px',
            }}
          >
            FUORI
          </button>
        )}


        {locked && (
          <p style={{
            marginTop: '30px',
            fontWeight: 'bold',
            fontSize: '30px',
          }}>
            Mich Tentori è fuori dall'asta per {selectedName}.
          </p>
        )}

        <div
          style={{
            marginTop: '40px',
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
          }}
        >
          <img
            src="/robin_hood.jpeg"
            alt=""
            style={{
              width: '50%',
              maxWidth: '600px',
              height: 'auto',
              borderRadius: '8px',
            }}
          />

          <img
            src="/squadra_ginew.jpeg"
            alt=""
            style={{
              width: '50%',
              maxWidth: '600px',
              height: 'auto',
              borderRadius: '8px',
            }}
          />
        </div>

      </div>
    </div>
  )
}

export default App
