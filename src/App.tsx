import { useEffect, useState } from 'react'
import { supabase } from './supabase'

const calciatori: string[] = [
  "Lautaro Martinez (INT)",
  "Nicolò Barella (INT)",
  "Alessandro Bastoni (INT)",
  "Federico Dimarco (INT)",
  "Marcus Thuram (INT)",
  "Hakan Calhanoglu (INT)",
  "Mike Maignan (MIL)",
  "Theo Hernandez (MIL)",
  "Rafael Leao (MIL)",
  "Christian Pulisic (MIL)",
  "Tijjani Reijnders (MIL)",
  "Fikayo Tomori (MIL)",
  "Paulo Dybala (ROM)",
  "Mats Hummels (ROM)",
  "Artem Dovbyk (ROM)",
  "Lorenzo Pellegrini (ROM)",
  "Gianluca Mancini (ROM)",
  "Bryan Cristante (ROM)",
  "Dušan Vlahović (JUV)",
  "Kenan Yildiz (JUV)",
  "Federico Chiesa (JUV)",
  "Teun Koopmeiners (JUV)",
  "Manuel Locatelli (JUV)",
  "Bremer (JUV)",
  "Rasmus Højlund (ATA)",
  "Ademola Lookman (ATA)",
  "Charles De Ketelaere (ATA)",
  "Ederson (ATA)",
  "Marten de Roon (ATA)",
  "Gianluca Scamacca (ATA)",
  "Riccardo Orsolini (BOL)",
  "Lewis Ferguson (BOL)",
  "Dan Ndoye (BOL)",
  "Remo Freuler (BOL)",
  "Joshua Zirkzee (BOL)",
  "Khvicha Kvaratskhelia (NAP)",
  "Romelu Lukaku (NAP)",
  "Matteo Politano (NAP)",
  "Stanislav Lobotka (NAP)",
  "Giovanni Di Lorenzo (NAP)",
  "Nico Gonzalez (FIO)",
  "Moise Kean (FIO)",
  "Robin Gosens (FIO)",
  "Lucas Beltran (FIO)",
  "Albert Gudmundsson (FIO)",
  "Domenico Berardi (SAS)",
  "Andrea Pinamonti (SAS)",
  "Armand Laurienté (SAS)",
]

function App() {

  const [selectedName, setSelectedName] = useState('')
  const [number, setNumber] = useState(0)
  const [localNumber, setLocalNumber] = useState(0)
  const [fuoriDallAsta, setLocked] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const filteredNames = calciatori
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
      setLocalNumber(0)
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
    setLocalNumber(0)
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

  // Cambio locale numero
  async function handleNumberChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = Number(event.target.value)
    setLocalNumber(value)
  }

  // Cambio offerta database
  async function handleSendOffer(offer: number) {
    setNumber(offer)
    const { error } = await supabase
      .from('shared_state')
      .update({
        number_value: offer,
      })
      .eq('id', 1)

    if (error) {
      console.error('Error updating number:', error)
    }
  }

  // Conferma
  async function handleExit() {
    setLocalNumber(0)
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
        backgroundColor: '#f6d09a',
      }}>

      <div style={{
        maxWidth: '1200px',
        marginLeft: '50px',
        marginRight: '50px',
        paddingLeft: '60px',
        paddingRight: '60px',
        paddingTop: '20px',
        paddingBottom: '20px',
      }}>

        <div style={{
          marginBottom: '100px',
          marginTop: '30px',
        }}>

          <label style={{
            fontSize: '40px',
          }}>
            Giocatore
          </label>

          <br />

          {isUserA ? (
            <div
              style={{
                position: 'relative',
                width: '100%',
                marginTop: '20px',
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
                  fontSize: '60px',
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
                fontSize: '60px',
                color: '#000000',
                fontWeight: 'bold',
                marginTop: '20px',
              }}
            >
              {selectedName}
            </p>
          )}
        </div>


        <div style={{ marginBottom: '40px' }}>

          {isUserA ? (
            <div>
              <label style={{
                fontSize: '60px',
              }}>
                Offerta Mich:
              </label>

              <label style={{
                fontSize: '60px',
                marginLeft: '30px',
              }}>
                {number === 0 || fuoriDallAsta ? '-' : number}
              </label>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: '50px',
              }}>
              <div
                style={{
                  width: '30%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '30px',
                }}>
                <label style={{
                  fontSize: '60px',
                  lineHeight: '1.1',
                }}>
                  Tua ultima offerta:
                </label>

                <label style={{
                  fontSize: '60px',
                  marginLeft: '30px',
                }}>
                  {number === 0 || fuoriDallAsta ? '-' : number}
                </label>
              </div>

              <div
                style={{
                  width: '30%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '30px',
                }}>
                <label style={{
                  fontSize: '60px',
                  lineHeight: '1.1',
                }}>
                  Nuova offerta:
                </label>

                <input
                  type="number"
                  value={localNumber}
                  disabled={fuoriDallAsta}
                  onChange={handleNumberChange}
                  style={{
                    width: '100.px',
                    backgroundColor: fuoriDallAsta ? '#3a3a3a' : '#ffffff',
                    color: fuoriDallAsta ? '#ffffff' : '#000000',
                    border: fuoriDallAsta ? '1px solid #555555' : '1px solid #cccccc',
                    borderRadius: '6px',
                    cursor: fuoriDallAsta ? 'not-allowed' : 'text',
                    opacity: 1,
                    height: '50px',
                    fontSize: '30px',
                    textAlign: 'center'
                  }}
                />

              </div>

              <div
                style={{
                  width: '30%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '30px',
                }}>
                <button
                  onClick={
                    () => handleSendOffer(localNumber)
                  }
                  disabled={!isUserB || fuoriDallAsta}
                  style={{
                    height: 'fit-content',
                    width: 'fit-content',
                    padding: '10px 20px',
                    fontSize: '40px',
                    marginTop: '20px',
                  }}
                >
                  Manda Offerta
                </button>

                <button
                  onClick={handleExit}
                  disabled={!isUserB || fuoriDallAsta}
                  style={{
                    height: 'fit-content',
                    width: 'fit-content',
                    padding: '10px 20px',
                    fontSize: '40px',
                    marginTop: '20px',
                  }}
                >
                  Esci dall'Asta
                </button>
              </div>


            </div>
          )}
        </div>

        {fuoriDallAsta && (
          <p style={{
            marginTop: '30px',
            fontWeight: 'bold',
            fontSize: '50px',
          }}>
            {isUserA ?
              `Mich è fuori dall'asta.`
              : `Sei fuori dall'asta per ${selectedName}.`
            }
          </p>
        )}

        <div
          style={{
            marginTop: '40px',
            display: 'flex',
            gap: '100px',
            justifyContent: 'center',
          }}
        >
          <img
            src="/robin_hood.jpeg"
            alt=""
            style={{
              width: '40%',
              maxWidth: '600px',
              height: 'auto',
              borderRadius: '8px',
            }}
          />

          <img
            src="/squadra_ginew.jpeg"
            alt=""
            style={{
              width: '40%',
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
