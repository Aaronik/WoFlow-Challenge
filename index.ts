import axios from 'axios'

// The challenge is here: https://woflow.notion.site/woflow/Nodes-on-Nodes-Challenge-350310b095174781a89a69fe7e325deb
// * Each request for a single node ID returns _an array of nodes_.
// * We're supposed to see how many occurances of a specific id there are. So, is this a circular tree?

// My approach / thoughts:
// * Use tail recursion to fetch the nodes. I don't know how many there are so I'd better
//   not rely on unfurling stacks.
// * If we find a node we've already encountered, we want to mark that we've seen it, but not
//   fetch it again, because then we'd get into an infinite loop.
// * This isn't really a tree, is it? Because every nodeId results in _multiple_ nodes.
// * Ok I threw caution to the wind and ran a version that would not handle circular graphs. What I found
//   is that it's not circular, there are some nodes that multiple are pointing _to_ but do not point
//   themselves towards anything. So my initial version is fine.
type Resp = Node[]

type Node = {
  id: string
  child_node_ids: string[]
}

const getNode = async (id: string): Promise<Resp> => {
  const resp = await axios.get('https://nodes-on-nodes-challenge.herokuapp.com/nodes/' + id)
  return resp.data
}

// Keeping track of all the different node ids we find.
// The key is the id, the value is the number of times we've seen
// this id.
const seenCount: { [id: string]: number } = {}

// These will help us keep track of the single highest one without having
// to iterate through our above data structure on every fetch, which would
// break our O(n) time.
let highestCount = 0
let mostCommonId = ""

// This is our main recursive function.
const start = async (seedId: string) => {
  const resp = await getNode(seedId)
  console.log('fetched id:', seedId, 'got response:', resp)


  // I'm calling topIds the nodes that are returned in the top level array.
  // It's these we're going to keep track of, with the assumption that every
  // time a child_node_id exists, it'll have an endpoint associated with it.
  const topIds = resp.map(node => node.id)
  for (let id of topIds) {

    // Update our data structure with the fetched id
    if (!seenCount[id]) {
      seenCount[id] = 1
    } else {
      seenCount[id] += 1
    }

    // Here we're keeping track of the most common id
    if (seenCount[id] > highestCount) {
      // this id is the highest!
      mostCommonId = id
      highestCount = seenCount[id]
    }
  }

  // We're going to log stuff out as our interaction with the program. Quick and simple.
  console.log('Total unique ids weve seen so far:', Object.keys(seenCount).length)
  console.log('the most common id so far is:', mostCommonId, 'with count:', highestCount)
  console.log("seenCount:", seenCount)

  // Now for the recursive step, we go through each child id and repeat the process
  // with it.
  for (let node of resp) {
    for (let childId of node.child_node_ids) {
      start(childId)
    }
  }
}

start('089ef556-dfff-4ff2-9733-654645be56fe')
