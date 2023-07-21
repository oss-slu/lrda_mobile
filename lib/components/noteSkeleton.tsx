import React from 'react';
import { View } from 'react-native';
import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Progressive,
} from 'rn-placeholder';

export default function NoteSkeleton() {
  return (
    <View>
        <View style={{ width: '98%', alignSelf: 'center', padding:10, borderRadius:20}}>
            <Placeholder Animation={Progressive}  Left={() => <PlaceholderMedia color='#ffff' size={100} style={{ borderRadius: 10, marginRight: 20 }} />}>
                <PlaceholderLine width={80} color='#ffff' height={20} style={{marginTop: 10}} />
                <PlaceholderLine width={40} color='#ffff' height={13}/>
                <PlaceholderLine width={30} color='#ffff' height={13}/>
            </Placeholder>
        </View>
        <View style={{ width: '98%', alignSelf: 'center', padding:10, borderRadius:20}}>
            <Placeholder Animation={Progressive}  Left={() => <PlaceholderMedia color='#ffff' size={100} style={{ borderRadius: 10, marginRight: 20 }} />}>
                <PlaceholderLine width={80} color='#ffff' height={20} style={{marginTop: 10}} />
                <PlaceholderLine width={40} color='#ffff' height={13}/>
                <PlaceholderLine width={30} color='#ffff' height={13}/>
            </Placeholder>
        </View>
        <View style={{ width: '98%', alignSelf: 'center', padding:10, borderRadius:20}}>
            <Placeholder Animation={Progressive}  Left={() => <PlaceholderMedia color='#ffff' size={100} style={{ borderRadius: 10, marginRight: 20 }} />}>
                <PlaceholderLine width={80} color='#ffff' height={20} style={{marginTop: 10}} />
                <PlaceholderLine width={40} color='#ffff' height={13}/>
                <PlaceholderLine width={30} color='#ffff' height={13}/>
            </Placeholder>
        </View>
        <View style={{ width: '98%', alignSelf: 'center', padding:10, borderRadius:20}}>
            <Placeholder Animation={Progressive}  Left={() => <PlaceholderMedia color='#ffff' size={100} style={{ borderRadius: 10, marginRight: 20 }} />}>
                <PlaceholderLine width={80} color='#ffff' height={20} style={{marginTop: 10}} />
                <PlaceholderLine width={40} color='#ffff' height={13}/>
                <PlaceholderLine width={30} color='#ffff' height={13}/>
            </Placeholder>
        </View>
        <View style={{ width: '98%', alignSelf: 'center', padding:10, borderRadius:20}}>
            <Placeholder Animation={Progressive}  Left={() => <PlaceholderMedia color='#ffff' size={100} style={{ borderRadius: 10, marginRight: 20 }} />}>
                <PlaceholderLine width={80} color='#ffff' height={20} style={{marginTop: 10}} />
                <PlaceholderLine width={40} color='#ffff' height={13}/>
                <PlaceholderLine width={30} color='#ffff' height={13}/>
            </Placeholder>
        </View>
        <View style={{ width: '98%', alignSelf: 'center', padding:10, borderRadius:20}}>
            <Placeholder Animation={Progressive}  Left={() => <PlaceholderMedia color='#ffff' size={100} style={{ borderRadius: 10, marginRight: 20 }} />}>
                <PlaceholderLine width={80} color='#ffff' height={20} style={{marginTop: 10}} />
                <PlaceholderLine width={40} color='#ffff' height={13}/>
                <PlaceholderLine width={30} color='#ffff' height={13}/>
            </Placeholder>
        </View>
        <View style={{ width: '98%', alignSelf: 'center', padding:10, borderRadius:20}}>
            <Placeholder Animation={Progressive}  Left={() => <PlaceholderMedia color='#ffff' size={100} style={{ borderRadius: 10, marginRight: 20 }} />}>
                <PlaceholderLine width={80} color='#ffff' height={20} style={{marginTop: 10}} />
                <PlaceholderLine width={40} color='#ffff' height={13}/>
                <PlaceholderLine width={30} color='#ffff' height={13}/>
            </Placeholder>
        </View>
    </View>

  );
}
