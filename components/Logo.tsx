import Link from 'next/link'
import React from 'react'

function Logo() {
  return (
    <Link className='font-bold text-3xl bg-gradient-to-r from-indigo-400 to-cyan-400 
    text-transparent bg-clip-text hover:cursor-pointer' href={'/'}>Porsesh</Link>
  )
}

export default Logo

