import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  baseText: {
    fontSize: 15,
    fontFamily: 'Cochin',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  rowView: {
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // Added padding for spacing
  },
  input: {
    width: 200,
    height: 40, // Added height to make the input more visible
    borderWidth: 1,
    padding: 10,
  },
});
