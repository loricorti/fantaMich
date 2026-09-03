import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import UserA from './UserA'

function App() {

  const [selectedName, setSelectedName] = useState('')
  const [number, setNumber] = useState(0)
  const [localNumber, setLocalNumber] = useState(0)
  const [fuoriDallAsta, setLocked] = useState(false)

  const params = new URLSearchParams(window.location.search)
  const role = params.get('role')

  const isUserA = role === 'A'
  const isUserB = role === 'B'
  const isUserC = role === 'C'

  const blockedUIForUserB = fuoriDallAsta || selectedName === ''

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
    handleNameChange('')
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
        backgroundColor: '#1e1a30',
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

        {isUserA ? (
          <UserA
            onNameChange={handleNameChange}
            onClearName={handleClearName}
          />
        ) : (
          <div>

            <div style={{
              marginBottom: isUserB ? '80px' : '200px',
              marginTop: '30px',
            }}>

              <label style={{
                fontSize: '70px',
                color: '#ffffff',
              }}>
                Giocatore
              </label>

              <br />

              <p
                style={{
                  margin: '5px 0 0 0',
                  padding: '10px',
                  fontSize: '100px',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  marginTop: '80px',
                }}
              >
                {selectedName}
              </p>
            </div>


            <div style={{ marginBottom: '40px' }}>

              {isUserC ? (
                <div>
                  <label style={{
                    fontSize: '100px',
                  }}>
                    Offerta Mich:
                  </label>

                  <label style={{
                    fontSize: '100px',
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
                        backgroundColor: blockedUIForUserB ? '#3a3a3a' : '#ffffff',
                        color: blockedUIForUserB ? '#ffffff' : '#000000',
                        border: blockedUIForUserB ? '1px solid #555555' : '1px solid #cccccc',
                        borderRadius: '6px',
                        cursor: blockedUIForUserB ? 'not-allowed' : 'text',
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
                      disabled={blockedUIForUserB}
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
                      disabled={blockedUIForUserB}
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
              <div
                style={{
                  marginTop: isUserB ? '50px' : '80px',
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'center',
                }}
              >
                <img
                  src="/robin_hood.jpeg"
                  alt=""
                  style={{
                    maxWidth: '300px',
                    height: 'auto',
                    borderRadius: '8px',
                  }}
                />

                <p style={{
                  fontWeight: 'bold',
                  fontSize: isUserB ? '40px' : '80px',
                  lineHeight: '80px',
                  height: '200px',
                }}>
                  {isUserB ?
                    `Sei fuori dall'asta per ${selectedName}.`
                    : `Mich è fuori dall'asta.`
                  }
                </p>

                <img
                  src="/squadra_ginew.jpeg"
                  alt=""
                  style={{
                    maxWidth: '300px',
                    height: 'auto',
                    borderRadius: '8px',
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
