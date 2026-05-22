import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { CHARACTERS } from '../data';
import { playHover } from '../utils/audio';

interface CharacterNetworkProps {
  lowDataMode: boolean;
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  image?: string;
  type: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  type: string;
  label: string;
}

export function CharacterNetwork({ lowDataMode }: CharacterNetworkProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [hoveredLink, setHoveredLink] = useState<Link | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Prepare data
    const nodes: Node[] = CHARACTERS.filter(c => c.relationships && c.relationships.length > 0 || c.id === 'tommy').map(c => ({
      id: c.id,
      name: c.name,
      image: c.image,
      type: c.type
    }));

    const links: Link[] = [];
    CHARACTERS.forEach(source => {
      if (source.relationships) {
        source.relationships.forEach(rel => {
          // Only add link if target exists in our filtered nodes
          if (nodes.find(n => n.id === rel.targetId)) {
            links.push({
              source: source.id,
              target: rel.targetId,
              type: rel.type,
              label: rel.label
            });
          }
        });
      }
    });

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    const g = svg.append('g');

    // Add glowing lines for links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => {
        if (d.type === 'Enemy' || d.type === 'Traitor') return '#ec4899'; // Pink for conflict
        return '#22d3ee'; // Cyan for allies
      })
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', d => d.type === 'Traitor' ? '5,5' : '0');

    // Add nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        setHoveredNode(d);
        playHover();
      })
      .on('mouseleave', () => setHoveredNode(null))
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    // Node circles with gradients/images
    node.append('circle')
      .attr('r', 25)
      .attr('fill', '#1a103c')
      .attr('stroke', d => d.type === 'Protagonist' ? '#22d3ee' : '#ec4899')
      .attr('stroke-width', 3)
      .style('filter', 'url(#glow)');

    // Add optional image patterns for richer node visuals only when network is not constrained
    const defs = svg.append('defs');
    if (!lowDataMode) {
      nodes.forEach(n => {
        if (n.image) {
          defs.append('pattern')
            .attr('id', `pattern-${n.id}`)
            .attr('patternUnits', 'objectBoundingBox')
            .attr('width', 1)
            .attr('height', 1)
            .append('image')
            .attr('xlink:href', n.image)
            .attr('width', 50)
            .attr('height', 50)
            .attr('preserveAspectRatio', 'xMidYMid slice');
        }
      });
    }

    node.select('circle')
      .attr('fill', d => (!lowDataMode && d.image) ? `url(#pattern-${d.id})` : '#1a103c');

    // Add names below nodes
    node.append('text')
      .text(d => d.name)
      .attr('dy', 45)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '10px')
      .attr('font-family', 'var(--font-mono)')
      .attr('class', 'uppercase tracking-[2px] pointer-events-none');

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'glow');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '2.5')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

  }, []);

  return (
    <div className="relative w-full aspect-[4/3] glass rounded-[40px] overflow-hidden border-white/10 shadow-2xl bg-black/40">
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <div className="font-mono text-[9px] tracking-[6px] text-pink font-black uppercase mb-1">DATA_STREAM_NETWORK</div>
        <div className="font-display italic text-4xl text-white uppercase">Criminal Dynamics</div>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 800 600"
        className="w-full h-full"
      />

      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-8 right-8 w-64 glass-heavy p-6 rounded-3xl border-cyan/30 shadow-2xl pointer-events-none"
          >
             <div className="mb-1 font-mono text-[9px] tracking-[4px] text-cyan uppercase">{hoveredNode.type}</div>
             <div className="font-display italic text-2xl text-white uppercase mb-4">{hoveredNode.name}</div>
             <div className="space-y-4">
                {CHARACTERS.find(c => c.id === hoveredNode.id)?.relationships?.map((rel, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                     <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${rel.type === 'Enemy' || rel.type === 'Traitor' ? 'bg-pink' : 'bg-cyan'}`} />
                        <span className="font-mono text-[8px] text-white/40 uppercase tracking-widest">{rel.type}</span>
                     </div>
                     <div className="text-[10px] text-white/70 italic">
                        {rel.label} → {CHARACTERS.find(c => c.id === rel.targetId)?.name}
                     </div>
                  </div>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-8 left-8 font-mono text-[8px] tracking-[4px] text-white/20 uppercase">
        Drag nodes to reorganize graph • Hover for intel
      </div>
    </div>
  );
}
