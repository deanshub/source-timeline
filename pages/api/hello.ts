// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import type {SigmaGraph} from '../../components/DepsGraph'
import {createProjectDeps} from '../../utils/createProjectDeps'

const cache = new Map<string, SigmaGraph>()
const key = "/Users/deansh/Projects/nissix/packages/cli/src/bin.ts"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SigmaGraph>
) {

  if (!cache.has(key)){
    cache.set(key, await createProjectDeps(key))
    console.log('miss')
  }else{
    console.log('hit')
  }

  res.status(200).json(cache.get(key)!)
}
