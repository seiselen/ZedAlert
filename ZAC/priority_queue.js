/*======================================================================
|>>> Class PriorityQueue
+-----------------------------------------------------------------------
| Overview: Implements a Priority Queue Data Structure via a [min] heap,
|           for utilization with Pathfinding System for 2D Grid Worlds.
| Authors:  > Steven Eiselen seiselen.github.io       (Modified Version)
|           > Eyas Ranjous   github.com/eyas-ranjous  (Original Version)
| Sources:  > Ranjous Heap:  github.com/datastructures-js/heap
|           > Ranjous Pri-Q: github.com/datastructures-js/priority-queue
| Language: JavaScript
+-----------------------------------------------------------------------
| Notes On Source / Derivation Thereof: 
|  > This class implements a reduced and merged version of Eyas Ranjous
|    'CustomHeap' and 'PriorityQueue' Data Structures (repo links above)
|    alongside other minor edits; with additional notes as follows...
|  > 'PriorityQueue' originally implemented a '[Min/Max/Custom] Heap' as
|    its internal data structure; which, as aforementioned, I had merged
|    such that this 'PriorityQueue' IS ITSELF a min heap.
|  > 'PriorityQueue' evaluator callback option 'priority' was removed as
|    I'm only utilizing 'comparator': ergo all code thereof (especially 
|    applicable conditional checks and handlers) was likewise removed.
+-----------------------------------------------------------------------
| Copyright Info:
|  > Original Version (c) 2020 Eyas Ranjous via MIT License
|  > Modified Version (c) 2022 Steven Eiselen upholding MIT License
+=====================================================================*/
class PriorityQueue {
  constructor(comparator, nodes, leaf) {
    if (typeof comparator !== 'function') {throw new Error('CustomHeap expects a comparator function');}
    this.comparator = comparator;
    this.nodes = Array.isArray(nodes) ? nodes : [];
    this.leaf = leaf || null;
  } // Ends Constructor

  //####################################################################
  //>>> QUERIES AND GETTERS
  //####################################################################

  isEmpty(){return (this.nodes.length===0);} // KEEP THIS YOU OCD-INFESTED IDIOT. Turned out PathFinder.findPath(...) needs it IAC.

  shouldSwap(p,q){return (p<0 || p>=this.nodes.length) ? false : (q<0 || q>=this.nodes.length) ? false : !this.compare(this.nodes[p], this.nodes[q]);}
  
  hasChild(p,c){return (c=='l') ? (((p*2)+1)<this.nodes.length) : (c=='r') ? (((p*2)+2)<this.nodes.length) : -1;}
    
  root(){return this.isEmpty() ? null : this.nodes[0];}  
  
  compare(p,q){return this.comparator(p,q) <= 0;}
  
  compareChildren(p){
    if (!this.hasChild(p,'l') && !this.hasChild(p,'r')){return -1;} 
    const cL = (p*2)+1; const cR = (p*2)+2; 
    return (!this.hasChild(p,'l')) ? cR : (!this.hasChild(p,'r')) ? cL : this.compare(this.nodes[cL], this.nodes[cR]) ? cL : cR;
  }

  //####################################################################
  //>>> BEHAVIORS AND [RE]SETTERS
  //####################################################################

  enqueue(element){
    const newNode = element;
    this.nodes.push(newNode);
    this.heapifyUp(this.nodes.length-1);
    if (this.leaf === null || !this.compare(newNode, this.leaf)){this.leaf = newNode;}
    return this;
  }

  dequeue(){
    if (this.isEmpty()){return null;}
    const root = this.root();
    this.nodes[0] = this.nodes[this.nodes.length-1];
    this.nodes.pop();
    this.heapifyDown(0);
    if (root === this.leaf){this.leaf = this.root();}
    return root;
  }

  heapifyUp(sIdx){
    let cIdx=sIdx; let pIdx=Math.floor((cIdx-1)/2); 
    while (this.shouldSwap(pIdx, cIdx)){this.swap(pIdx, cIdx); cIdx=pIdx; pIdx=Math.floor((cIdx-1)/2);}
  }

  heapifyDown(sIdx){
    let pIdx=sIdx; let cIdx=this.compareChildren(pIdx); 
    while (this.shouldSwap(pIdx, cIdx)){this.swap(pIdx, cIdx); pIdx=cIdx; cIdx=this.compareChildren(pIdx);}
  }

  clear(){this.nodes = []; this.leaf = null;}

  swap(p,q){const temp=this.nodes[p]; this.nodes[p]=this.nodes[q]; this.nodes[q]=temp;}  

} // Ends Class PriorityQueue