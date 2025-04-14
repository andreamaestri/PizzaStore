import { useState } from 'react';

export function useNavigation(initialItems, defaultSelectedIndex = 0) {
  const [navItems, setNavItems] = useState(initialItems);
  const [selectedIndex, setSelectedIndex] = useState(defaultSelectedIndex);

  // Select a navigation item
  const selectItem = (index) => {
    setSelectedIndex(index);
  };

  // Toggle visibility of children for an item with nested navigation
  const toggleItemChildren = (index) => {
    setNavItems((prevItems) =>
      prevItems.map((item) =>
        item.index === index
          ? { ...item, showChildren: !item.showChildren }
          : item
      )
    );
  };

  // Get the currently selected component
  const getSelectedComponent = () => {
    // First check top level items
    const topLevelItem = navItems.find(item => item.index === selectedIndex);
    if (topLevelItem?.component) {
      return topLevelItem.component;
    }

    // Then check nested items
    for (const item of navItems) {
      if (item.children) {
        const selectedChild = item.children.find(
          child => child.index === selectedIndex
        );
        if (selectedChild?.component) {
          return selectedChild.component;
        }
      }
    }

    // Return null if no matching component found
    return null;
  };

  return {
    navItems,
    selectedIndex,
    selectItem,
    toggleItemChildren,
    getSelectedComponent,
  };
}
