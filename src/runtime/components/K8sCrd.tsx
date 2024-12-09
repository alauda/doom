export interface K8sCrdProps {
  name: string
}

export const K8sCrd = ({ name }: K8sCrdProps) => {
  return <h2>{name}</h2>
}

export default K8sCrd
