/* eslint-env jest */
import * as React from 'react';
import renderer from 'react-test-renderer';
import { Text } from 'react-native';
import { MonoText } from '../StyledText';

describe('MonoText', () => {
  it('renders correctly', () => {
    const tree = renderer.create(
      <MonoText>
        <Text>Snapshot test!</Text>
      </MonoText>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
