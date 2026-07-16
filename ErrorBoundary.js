import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('App crashed:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.title}>⚠️ App Error (screenshot this)</Text>
          <Text style={styles.message}>{String(this.state.error?.message || this.state.error)}</Text>
          <Text style={styles.stackLabel}>Stack trace:</Text>
          <Text style={styles.stack}>{String(this.state.error?.stack || 'No stack available')}</Text>
          {this.state.errorInfo?.componentStack ? (
            <>
              <Text style={styles.stackLabel}>Component stack:</Text>
              <Text style={styles.stack}>{this.state.errorInfo.componentStack}</Text>
            </>
          ) : null}
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  title: { fontSize: 18, fontWeight: '800', color: '#D32F2F', marginBottom: 12 },
  message: { fontSize: 14, color: '#111', marginBottom: 16, fontWeight: '600' },
  stackLabel: { fontSize: 12, fontWeight: '700', color: '#555', marginTop: 8, marginBottom: 4 },
  stack: { fontSize: 11, color: '#333', fontFamily: 'monospace' },
});

export default ErrorBoundary;
