import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViceCityMap } from './ViceCityMap';
import { GANGS } from '../data';

describe('ViceCityMap Component', () => {
  it('should render the map container and locations', () => {
    const onGangHover = vi.fn();
    const { container } = render(
      <ViceCityMap onGangHover={onGangHover} hoveredGangId={null} />
    );

    // Verify container and title
    expect(screen.getByText('TERRITORY ANALYSIS')).toBeInTheDocument();
    expect(screen.getByText('LOCAL_MAP_VD_Archive')).toBeInTheDocument();

    // Verify locations are rendered
    expect(screen.getByText('Vercetti Estate')).toBeInTheDocument();
    expect(screen.getByText('Malibu Club')).toBeInTheDocument();
  });

  it('should toggle 3D projection on button click', () => {
    const onGangHover = vi.fn();
    render(<ViceCityMap onGangHover={onGangHover} hoveredGangId={null} />);

    const toggleBtn = screen.getByRole('button', { name: /ACTIVATE TACTICAL 3D/ });
    expect(toggleBtn).toBeInTheDocument();

    // Toggle 3D projection ON
    fireEvent.click(toggleBtn);
    expect(screen.getByText('3D PROJECTION: ON')).toBeInTheDocument();

    // Toggle 3D projection OFF
    fireEvent.click(screen.getByRole('button', { name: /3D PROJECTION: ON/ }));
    expect(screen.getByText('ACTIVATE TACTICAL 3D')).toBeInTheDocument();
  });

  it('should trigger onGangHover when hovering gang territory path', () => {
    const onGangHover = vi.fn();
    const { container } = render(
      <ViceCityMap onGangHover={onGangHover} hoveredGangId={null} />
    );

    // Get territory paths
    const paths = container.querySelectorAll('path');
    // Find a path representing a gang territory. Gang paths are inside '<g class="territories">'
    const territoryGroup = container.querySelector('.territories');
    expect(territoryGroup).toBeInTheDocument();

    const firstTerritoryPath = territoryGroup?.querySelector('path');
    expect(firstTerritoryPath).toBeInTheDocument();

    if (firstTerritoryPath) {
      fireEvent.mouseEnter(firstTerritoryPath);
      expect(onGangHover).toHaveBeenCalledWith(GANGS[0].id);

      fireEvent.mouseLeave(firstTerritoryPath);
      expect(onGangHover).toHaveBeenCalledWith(null);
    }
  });

  it('should display the hovered gang detail at the bottom when hoveredGangId is set', () => {
    const onGangHover = vi.fn();
    render(<ViceCityMap onGangHover={onGangHover} hoveredGangId="vercetti" />);

    expect(screen.getByText('TARGET DETECTED')).toBeInTheDocument();
    expect(screen.getAllByText('Vercetti Gang')[0]).toBeInTheDocument();
    expect(screen.getByText('Starfish Island, Vercetti Estate')).toBeInTheDocument();
  });
});
